import os
from dataclasses import dataclass

from langchain_openai import AzureChatOpenAI
from loguru import logger


@dataclass
class ModelSpec:
    deployment_name: str
    model_name: str
    max_reply_tokens: int


def azure_chat_model(
    spec: ModelSpec = ModelSpec(
        deployment_name="gpt-4o-mini", model_name="gpt-4o-mini", max_reply_tokens=2048
    ),
) -> AzureChatOpenAI:
    base_ = os.environ["AZURE_OPENAI_API_BASE"]
    logger.info(f"base url: {base_}, model name: {spec.model_name}")
    return AzureChatOpenAI(
        deployment_name=spec.deployment_name,
        model_name=spec.model_name,
        azure_endpoint=base_,
        openai_api_version="2024-10-21",
        openai_api_key=os.environ["AZURE_OPENAI_API_KEY"],
        # temperature=temperature,
        max_tokens=spec.max_reply_tokens,
    )
