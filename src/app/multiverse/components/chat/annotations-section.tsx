import React, { useState, useEffect } from 'react';
import { MessageAnnotation, ToolState, TimelineItem } from '@/app/multiverse/types/chat';
import { ToolTimeline } from './tool-timeline';

interface AnnotationsSectionProps {
  annotations?: MessageAnnotation[];
}

function createTimelineItem(toolState: ToolState): TimelineItem {
  return {
    id: `${toolState.toolCallId}_${Date.now()}`,
    toolCallId: toolState.toolCallId,
    toolName: toolState.toolName,
    status: toolState.status,
    timestamp: Date.now(),
    title: `${toolState.toolName} ${toolState.status === 'complete' ? 'completed' : toolState.status === 'error' ? 'failed' : 'running'}`,
    // Always include args in message field regardless of status
    message: toolState.args || (toolState.status === 'in-progress' ? 'Tool is executing...' : undefined),
    error: toolState.status === 'error' 
      ? (typeof toolState.result === 'string' 
          ? toolState.result 
          : JSON.stringify(toolState.result))
      : undefined,
    result: toolState.status === 'complete' ? toolState.result : undefined
  };
}

export function AnnotationsSection({ annotations }: AnnotationsSectionProps): React.ReactElement | null {
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);

  // Process annotations to update timeline
  useEffect(() => {
    if (!annotations) return;
    
    const newTimelineItems: TimelineItem[] = [];
    const seenTools = new Set<string>();
    const currentStates: Record<string, ToolState> = {};
    
    // Process annotations in reverse to get latest state first
    [...annotations].reverse().forEach(annotation => {
      if (annotation.type === 'tool-status' && annotation.toolCallId) {
        // Only keep the latest state for each tool
        if (!seenTools.has(annotation.toolCallId)) {
          seenTools.add(annotation.toolCallId);
          
          // Check if this is an error state
          const resultStr = typeof annotation.result === 'string' 
            ? annotation.result 
            : JSON.stringify(annotation.result);
          
          const isError = resultStr?.includes('error') || 
                        resultStr?.includes('failed') ||
                        resultStr?.includes('Authentication failed');

          // If it's an error and we have a later success, skip it
          if (isError && currentStates[annotation.toolCallId]?.status === 'complete') {
            return;
          }

          const newState: ToolState = {
            toolCallId: annotation.toolCallId,
            toolName: annotation.toolName || 'Unknown Tool',
            status: isError ? 'error' : (annotation.status || 'in-progress'),
            args: annotation.args,
            result: annotation.result
          };

          // Create timeline item
          const timelineItem = createTimelineItem(newState);
          newTimelineItems.push(timelineItem);

          currentStates[annotation.toolCallId] = newState;
        }
      }
    });
    
    // Update timeline items
    setTimelineItems(prev => {
      // Keep existing items that aren't in the new set
      const existingItems = prev.filter(item => 
        !newTimelineItems.some(newItem => newItem.toolCallId === item.toolCallId)
      );
      // Add new items at the end
      return [...existingItems, ...newTimelineItems];
    });
  }, [annotations]);

  if (!annotations?.length) return null;

  // Only render timeline
  return <ToolTimeline items={timelineItems} />;
}
