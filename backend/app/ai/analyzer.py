"""
LLM-powered incident transcript analyzer.

Supports multiple LLM providers via environment configuration.
Validates output against Pydantic schemas before returning.
"""

import json
import logging
import os
from abc import ABC, abstractmethod

from openai import AsyncOpenAI

from app.ai.prompts import INCIDENT_ANALYZER_SYSTEM_PROMPT, build_analysis_prompt
from app.ai.schemas import IncidentAnalysis

logger = logging.getLogger(__name__)


class LLMProvider(ABC):
    """Abstract base for LLM providers."""

    @abstractmethod
    async def generate_json(self, system_prompt: str, user_prompt: str) -> dict:
        """Send a prompt to the LLM and return parsed JSON."""
        ...


class OpenAIProvider(LLMProvider):
    """OpenAI-compatible provider (also works with Azure, Groq, Together, etc.)."""

    def __init__(self):
        api_key = os.getenv("LLM_API_KEY")
        if not api_key:
            raise ValueError("LLM_API_KEY environment variable is required")

        base_url = os.getenv("LLM_API_BASE")
        self.model = os.getenv("LLM_MODEL", "gpt-4o-mini")

        client_kwargs = {"api_key": api_key}
        if base_url:
            client_kwargs["base_url"] = base_url

        self.client = AsyncOpenAI(**client_kwargs)

    async def generate_json(self, system_prompt: str, user_prompt: str) -> dict:
        logger.info("Calling OpenAI model=%s", self.model)

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.1,  # Low temperature for consistent, precise extraction
        )

        content = response.choices[0].message.content
        if not content:
            raise ValueError("LLM returned empty response")

        return json.loads(content)


class GeminiProvider(LLMProvider):
    """Google Gemini provider using the OpenAI-compatible endpoint."""

    def __init__(self):
        api_key = os.getenv("LLM_API_KEY")
        if not api_key:
            raise ValueError("LLM_API_KEY environment variable is required")

        self.model = os.getenv("LLM_MODEL", "gemini-1.5-flash")

        # Gemini supports OpenAI-compatible API
        self.client = AsyncOpenAI(
            api_key=api_key,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        )

    async def generate_json(self, system_prompt: str, user_prompt: str) -> dict:
        logger.info("Calling Gemini model=%s", self.model)

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.1,
        )

        content = response.choices[0].message.content
        if not content:
            raise ValueError("LLM returned empty response")

        return json.loads(content)


def _create_provider() -> LLMProvider:
    """Factory: create the appropriate LLM provider from environment config."""
    provider_name = os.getenv("LLM_PROVIDER", "openai").lower()

    providers = {
        "openai": OpenAIProvider,
        "gemini": GeminiProvider,
    }

    provider_class = providers.get(provider_name)
    if not provider_class:
        raise ValueError(
            f"Unsupported LLM_PROVIDER: '{provider_name}'. "
            f"Supported: {', '.join(providers.keys())}"
        )

    return provider_class()


class IncidentAnalyzer:
    """
    Analyzes incident transcripts using an LLM and returns
    structured incident intelligence.
    """

    def __init__(self):
        self._provider: LLMProvider | None = None

    @property
    def provider(self) -> LLMProvider:
        """Lazy-initialize the provider so env vars are read at call time."""
        if self._provider is None:
            self._provider = _create_provider()
        return self._provider

    async def analyze(self, transcript: list[dict]) -> IncidentAnalysis:
        """
        Analyze a transcript and return structured incident intelligence.

        Args:
            transcript: List of dicts with keys: speaker, timestamp, text

        Returns:
            Validated IncidentAnalysis with facts, hypotheses, conflicts, etc.

        Raises:
            ValueError: If the LLM output fails validation
        """
        user_prompt = build_analysis_prompt(transcript)

        # Call LLM with retry on validation failure
        max_retries = 2
        last_error = None

        for attempt in range(max_retries + 1):
            try:
                raw_output = await self.provider.generate_json(
                    system_prompt=INCIDENT_ANALYZER_SYSTEM_PROMPT,
                    user_prompt=user_prompt,
                )

                # Validate against Pydantic schema
                analysis = IncidentAnalysis.model_validate(raw_output)

                logger.info(
                    "Analysis complete: %d topics, %d decisions, %d timeline events, %d risks",
                    len(analysis.topics),
                    len(analysis.decisions),
                    len(analysis.timeline),
                    len(analysis.risks),
                )

                return analysis

            except (json.JSONDecodeError, ValueError) as e:
                last_error = e
                logger.warning(
                    "LLM output validation failed (attempt %d/%d): %s",
                    attempt + 1,
                    max_retries + 1,
                    str(e),
                )
                # Reset provider to force re-init on next attempt if needed
                continue

        raise ValueError(
            f"Failed to get valid analysis after {max_retries + 1} attempts. "
            f"Last error: {last_error}"
        )


# Module-level singleton for convenience
analyzer = IncidentAnalyzer()
