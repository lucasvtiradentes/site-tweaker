#!/usr/bin/env bash
set -euo pipefail

GREEN=$'\033[32m'
BLUE=$'\033[34m'
ORANGE=$'\033[33m'
RESET=$'\033[0m'

claude --print --verbose --dangerously-skip-permissions --output-format stream-json --include-partial-messages "$@" | \
  jq --unbuffered -j --arg green "$GREEN" --arg blue "$BLUE" --arg orange "$ORANGE" --arg reset "$RESET" '
    if .type == "stream_event" and .event.type == "content_block_delta" and .event.delta.type == "text_delta" then
      .event.delta.text
    elif .type == "stream_event" and .event.type == "content_block_start" and .event.content_block.type == "tool_use" then
      if .event.content_block.name == "TodoWrite" then
        "\n" + $blue + "[tool] " + .event.content_block.name + " "
      elif .event.content_block.name == "Edit" then
        "\n" + $orange + "[tool] " + .event.content_block.name + " "
      else
        "\n" + $green + "[tool] " + .event.content_block.name + " "
      end
    elif .type == "stream_event" and .event.type == "content_block_delta" and .event.delta.type == "input_json_delta" then
      .event.delta.partial_json
    elif .type == "stream_event" and .event.type == "content_block_stop" then
      $reset + "\n"
    else empty end
  '
