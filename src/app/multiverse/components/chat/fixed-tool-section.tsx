import React from 'react';
import { MessageAnnotation } from '@/app/multiverse/types/chat';
import { AnnotationsSection } from '@/app/multiverse/components/chat/annotations-section';
import { ToolUsage } from '@/app/multiverse/components/chat/tool-usage';

interface FixedToolSectionProps {
  content: string;
  annotations?: MessageAnnotation[];
}

interface ToolCall {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
}

interface ToolResult {
  toolCallId: string;
  result: string;
}

interface ToolUsageData {
  toolName: string;
  input: string;
  response: string;
}

function parseToolUsage(content: string): ToolUsageData[] {
  const toolCalls: ToolCall[] = [];
  const toolResults: ToolResult[] = [];
  
  try {
    const toolCallsMatch = content.match(/Tool calls:\s*(\[[\s\S]*?\])\s*Tool results:/);
    if (toolCallsMatch) {
      const parsedCalls = JSON.parse(toolCallsMatch[1]);
      toolCalls.push(...parsedCalls);
    }

    const toolResultsMatch = content.match(/Tool results:\s*(\[[\s\S]*?\])/);
    if (toolResultsMatch) {
      const parsedResults = JSON.parse(toolResultsMatch[1]);
      toolResults.push(...parsedResults);
    }
  } catch (err) {
    console.error('Error parsing tool usage:', err);
    return [];
  }

  return toolCalls.map((call: ToolCall) => {
    const result = toolResults.find((r: ToolResult) => r.toolCallId === call.toolCallId);
    return {
      toolName: call.toolName,
      input: JSON.stringify(call.args, null, 2),
      response: result ? 
        (() => {
          try {
            const parsed = JSON.parse(result.result);
            return JSON.stringify(parsed, null, 2);
          } catch {
            return result.result;
          }
        })() : 
        'No response received'
    };
  });
}

export function FixedToolSection({ content, annotations }: FixedToolSectionProps) {
  // If we have annotations, use those instead of parsing from content
  if (annotations?.length) {
    return (
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 z-10">
          <AnnotationsSection annotations={annotations} />
        </div>
      </div>
    );
  }

  // Fall back to parsing from content if no annotations
  const toolUsages = parseToolUsage(content);
  if (toolUsages.length === 0) return null;

  return (
    <div className="relative">
      <div className="absolute top-0 left-0 right-0 z-10 space-y-4">
        {toolUsages.map((usage, index) => (
          <ToolUsage key={index} {...usage} />
        ))}
      </div>
    </div>
  );
}
