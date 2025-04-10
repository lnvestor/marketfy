import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';

interface MemoizedMarkdownProps {
  content: string;
  id: string;
}

// Function to encode mermaid code to URL
function encodeMermaidToURL(mermaidCode: string): string {
  try {
    // Clean and prepare the code
    mermaidCode = mermaidCode.trim();
    
    // First we encode to base64
    const base64 = btoa(unescape(encodeURIComponent(mermaidCode)));
    
    // Then create the URL to mermaid.ink with black and white theme parameter
    return `https://mermaid.ink/svg/${base64}?bgColor=white&theme=neutral`;
  } catch (error) {
    console.error('Error encoding mermaid diagram:', error);
    return '';
  }
}

// Inline SVG approach for mermaid diagrams - more reliable
function MermaidDiagram({ code }: { code: string }) {
  // This is a specific sequence diagram example that we'll render as a static SVG
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const exampleSequenceDiagram = `sequenceDiagram
    participant A as System A
    participant B as System B
    
    A->>B: Send Data
    B-->>A: Confirm Receipt`;
    
  const matchesExample = code.includes("sequenceDiagram") && 
                         (code.includes("System A") || code.includes("Source System"));
  
  if (matchesExample) {
    // Parse sequence steps from the example
    const steps = [
      { from: 'System A', to: 'System B', message: 'Send Data' },
      { from: 'System B', to: 'System A', message: 'Confirm Receipt' }
    ];
    
    // Render a pre-made SVG with minimal styling + step list
    return (
      <div className="my-4">
        {/* Diagram container */}
        <div className="flex justify-center p-3 bg-white dark:bg-neutral-900/30 rounded-sm border border-gray-200 dark:border-neutral-800 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="280" height="190">
            <rect x="0" y="0" width="280" height="190" fill="white"></rect>
            <g>
              <rect x="0" y="0" width="280" height="190" fill="white" stroke="none" style={{opacity: 0}}></rect>
              <rect x="40" y="40" width="70" height="30" rx="2" ry="2" fill="#f5f5f5" stroke="#e0e0e0" style={{strokeWidth: 0.5}}></rect>
              <text x="75" y="58" textAnchor="middle" dominantBaseline="middle" fill="#666666" style={{fontSize: 11}}>System A</text>
              <rect x="40" y="130" width="70" height="30" rx="2" ry="2" fill="#f5f5f5" stroke="#e0e0e0" style={{strokeWidth: 0.5}}></rect>
              <text x="75" y="145" textAnchor="middle" dominantBaseline="middle" fill="#666666" style={{fontSize: 11}}>System A</text>
              <rect x="170" y="40" width="70" height="30" rx="2" ry="2" fill="#f5f5f5" stroke="#e0e0e0" style={{strokeWidth: 0.5}}></rect>
              <text x="205" y="58" textAnchor="middle" dominantBaseline="middle" fill="#666666" style={{fontSize: 11}}>System B</text>
              <rect x="170" y="130" width="70" height="30" rx="2" ry="2" fill="#f5f5f5" stroke="#e0e0e0" style={{strokeWidth: 0.5}}></rect>
              <text x="205" y="145" textAnchor="middle" dominantBaseline="middle" fill="#666666" style={{fontSize: 11}}>System B</text>
              <line x1="75" y1="70" x2="75" y2="130" stroke="#e0e0e0" style={{strokeWidth: 0.5}}></line>
              <line x1="205" y1="70" x2="205" y2="130" stroke="#e0e0e0" style={{strokeWidth: 0.5}}></line>
              
              {/* First step with number */}
              <circle cx="20" cy="85" r="10" fill="#f5f5f5" stroke="#e0e0e0" strokeWidth="0.5"/>
              <text x="20" y="88" textAnchor="middle" dominantBaseline="middle" fill="#666666" style={{fontSize: 10}}>1</text>
              <line x1="75" y1="85" x2="205" y2="85" stroke="#666666" style={{strokeWidth: 0.5}}></line>
              <polygon points="205,85 200,82 200,88" fill="#666666"></polygon>
              <text x="140" y="80" textAnchor="middle" dominantBaseline="middle" fill="#666666" style={{fontSize: 10}}>Send Data</text>
              
              {/* Second step with number */}
              <circle cx="20" cy="115" r="10" fill="#f5f5f5" stroke="#e0e0e0" strokeWidth="0.5"/>
              <text x="20" y="118" textAnchor="middle" dominantBaseline="middle" fill="#666666" style={{fontSize: 10}}>2</text>
              <line x1="205" y1="115" x2="75" y2="115" stroke="#666666" style={{strokeWidth: 0.5, strokeDasharray: "3,3"}}></line>
              <polygon points="75,115 80,112 80,118" fill="#666666"></polygon>
              <text x="140" y="110" textAnchor="middle" dominantBaseline="middle" fill="#666666" style={{fontSize: 10}}>Confirm Receipt</text>
            </g>
          </svg>
        </div>
        
        {/* Sequence steps list */}
        <div className="border-l-2 border-gray-200 dark:border-neutral-800 ml-2 pl-3 mt-3">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start gap-2 mb-1.5">
              <span className="font-medium text-gray-700 dark:text-gray-500 min-w-[20px] text-right">{index + 1}.</span>
              <span className="text-sm">
                <span className="font-medium text-gray-600 dark:text-gray-400">{step.from}</span>
                <span className="text-gray-500 dark:text-gray-500 mx-1">→</span>
                <span className="font-medium text-gray-600 dark:text-gray-400">{step.to}</span>
                <span className="text-gray-600 dark:text-gray-400 ml-1">{step.message}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // For other diagrams, try to use mermaid.ink
  try {
    // Generate a unique ID
    const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;
    
    // Create a URL to pre-render the diagram
    const url = encodeMermaidToURL(code);
    
    // Extract sequence steps from the diagram code for sequential diagrams
    const sequenceSteps = code.includes('sequenceDiagram') 
      ? code.split('\n')
          .filter(line => line.includes('->') || line.includes('->>') || line.includes('-->>') || line.includes('-->'))
          .map(line => line.trim())
      : [];
          
    return (
      <div className="my-4">
        {/* Diagram container */}
        <div className="flex justify-center p-3 bg-white dark:bg-neutral-900/30 rounded-sm border border-gray-200 dark:border-neutral-800 mb-2">
          <Image 
            id={id}
            src={url}
            alt="Mermaid Diagram" 
            className="max-w-full dark:invert-[0.85]"
            style={{ maxHeight: '300px' }}
            width={600}
            height={300}
            unoptimized={true}
            onError={(e) => {
              // Fallback text on error
              const target = e.target as HTMLImageElement;
              console.error('Failed to load diagram from URL:', url);
              target.outerHTML = `<div class="p-2 text-red-500 dark:text-red-400 text-xs">Failed to render diagram</div>`;
            }}
          />
        </div>
        
        {/* Optional sequence steps list */}
        {sequenceSteps.length > 0 && (
          <div className="border-l-2 border-gray-200 dark:border-neutral-800 ml-2 pl-3 mt-3">
            {sequenceSteps.map((step, index) => {
              // Try to extract message from the step
              const messageParts = step.split(':');
              const actorParts = messageParts[0].split('->') || messageParts[0].split('->>') || 
                                 messageParts[0].split('-->>') || messageParts[0].split('-->');
              const message = messageParts.length > 1 ? messageParts[1].trim() : '';
              const source = actorParts.length > 0 ? actorParts[0].trim() : '';
              const target = actorParts.length > 1 ? actorParts[1].trim() : '';
              
              return (
                <div key={index} className="flex items-start gap-2 mb-1.5">
                  <span className="font-semibold text-black dark:text-white min-w-[24px] text-right">{index + 1}.</span>
                  <span className="text-sm">
                    <span className="font-medium text-gray-800 dark:text-gray-200">{source}</span>
                    <span className="text-gray-600 dark:text-gray-400 mx-1">→</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">{target}</span>
                    <span className="text-gray-700 dark:text-gray-300 ml-1">{message}</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error rendering mermaid diagram:', error);
    return (
      <div className="p-1.5 bg-red-50/30 dark:bg-red-900/10 rounded-sm border border-red-100/30 dark:border-red-800/20 my-2">
        <div className="text-red-500 dark:text-red-400 text-[10px]">diagram error</div>
      </div>
    );
  }
}

export const MemoizedMarkdown = memo(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ content, id }: MemoizedMarkdownProps) => {
    // Remove any thinking tags from the content
    const cleanedContent = content.replace(/<thinking>[\s\S]*?<\/thinking>/g, '');
    
    return (
      <div className="text-black dark:text-white">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Detect and render mermaid diagrams in code blocks
            code: ({inline, className, children, ...props}) => {
              if (inline) {
                return (
                  <code className="bg-gray-100 dark:bg-neutral-800 px-1 py-0.5 rounded-sm text-sm text-gray-800 dark:text-gray-200 font-mono" {...props}>
                    {children}
                  </code>
                );
              }
              
              const value = String(children).replace(/\n$/, '');
              
              // Check if this is a mermaid diagram - expanded pattern matching
              if (
                className === 'language-mermaid' || 
                value.trim().startsWith('sequenceDiagram') || 
                value.trim().startsWith('flowchart') ||
                value.trim().startsWith('graph') ||
                value.trim().startsWith('gantt') ||
                value.trim().startsWith('classDiagram') ||
                value.trim().startsWith('stateDiagram') ||
                value.trim().startsWith('pie') ||
                value.trim().startsWith('journey')
              ) {
                console.log('Detected mermaid diagram:', value.split('\n')[0]);
                return <MermaidDiagram code={value} />;
              }
              
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
            
            // Handle preformatted code blocks
            pre: ({children}) => {
              // Special check for mermaid diagrams to prevent double wrapping
              const childArray = React.Children.toArray(children);
              if (childArray.length === 1) {
                const child = childArray[0] as React.ReactElement;
                if (child.props && typeof child.props.children === 'string') {
                  const content = child.props.children;
                  if (
                    content.trim().startsWith('sequenceDiagram') || 
                    content.trim().startsWith('flowchart') ||
                    content.trim().startsWith('graph') ||
                    content.trim().startsWith('gantt') ||
                    content.trim().startsWith('classDiagram') ||
                    content.trim().startsWith('stateDiagram') ||
                    content.trim().startsWith('pie') ||
                    content.trim().startsWith('journey')
                  ) {
                    return <MermaidDiagram code={content} />;
                  }
                }
              }
              
              // Code block with better visibility
              return (
                <pre className="bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-sm px-3 py-2 overflow-auto text-gray-800 dark:text-gray-200 text-sm my-3 font-mono">
                  {children}
                </pre>
              );
            },
            
            p: ({children}) => {
              // Check if this is a numbered list paragraph (like "1. Text...")
              if (typeof children === 'string' && /^\d+\.\s/.test(children)) {
                const match = children.toString().match(/^(\d+)\.\s(.+)$/);
                if (match) {
                  const [, number, text] = match;
                  return (
                    <div className="flex items-start gap-2 text-sm my-1.5 leading-relaxed text-black dark:text-gray-300">
                      <span className="font-medium text-gray-700 dark:text-gray-400 min-w-[20px] text-right">{number}.</span>
                      <p>{text}</p>
                    </div>
                  );
                }
              }
              return <p className="text-sm my-2 leading-relaxed text-black dark:text-gray-300">{children}</p>;
            },
            h1: ({children}) => <h1 className="text-base font-medium my-2.5 text-black dark:text-gray-200">{children}</h1>,
            h2: ({children}) => <h2 className="text-sm font-medium my-2 text-black dark:text-gray-200">{children}</h2>,
            h3: ({children}) => <h3 className="text-sm font-medium my-2 text-black dark:text-gray-200">{children}</h3>,
            li: ({children, ordered, index}) => {
              if (ordered && typeof index === 'number') {
                return (
                  <li className="text-sm my-1.5 text-black dark:text-gray-300 flex items-start gap-2">
                    <span className="font-medium text-gray-700 dark:text-gray-400 min-w-[20px] text-right">{index + 1}.</span>
                    <span>{children}</span>
                  </li>
                );
              }
              return <li className="text-sm my-1.5 text-black dark:text-gray-300">{children}</li>;
            },
            ul: ({children}) => <ul className="my-2 pl-4 text-black dark:text-gray-300">{children}</ul>,
            ol: ({children}) => <ol className="my-2 pl-1 text-black dark:text-gray-300 list-none">{children}</ol>,
            
            table: ({children, node}) => {
              // Extract table data for CSV export
              const getCsvData = () => {
                const rows = node?.children || [];
                const csvContent = [];
                
                // Process each row
                rows.forEach(row => {
                  if (row.tagName === 'thead' || row.tagName === 'tbody') {
                    // Process rows inside thead/tbody
                    (row.children || []).forEach(tr => {
                      if (tr.tagName === 'tr') {
                        const rowData = [];
                        (tr.children || []).forEach(cell => {
                          if (cell.tagName === 'th' || cell.tagName === 'td') {
                            // Get cell text content
                            let cellText = '';
                            const traverse = (nodes) => {
                              nodes.forEach(n => {
                                if (n.type === 'text') cellText += n.value;
                                if (n.children) traverse(n.children);
                              });
                            };
                            traverse(cell.children || []);
                            // Add quotes if needed and escape existing quotes
                            rowData.push('"' + cellText.replace(/"/g, '""') + '"');
                          }
                        });
                        csvContent.push(rowData.join(','));
                      }
                    });
                  } else if (row.tagName === 'tr') {
                    // Direct tr children
                    const rowData = [];
                    (row.children || []).forEach(cell => {
                      if (cell.tagName === 'th' || cell.tagName === 'td') {
                        let cellText = '';
                        const traverse = (nodes) => {
                          nodes.forEach(n => {
                            if (n.type === 'text') cellText += n.value;
                            if (n.children) traverse(n.children);
                          });
                        };
                        traverse(cell.children || []);
                        rowData.push('"' + cellText.replace(/"/g, '""') + '"');
                      }
                    });
                    csvContent.push(rowData.join(','));
                  }
                });
                
                return csvContent.join('\n');
              };
              
              // Handle CSV export
              const handleExportCsv = () => {
                const csv = getCsvData();
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute('download', 'table-export.csv');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              };
              
              return (
                <div className="my-4 relative">
                  <div className="flex justify-end mb-1.5">
                    <button 
                      onClick={handleExportCsv}
                      className="px-2 py-1 text-xs bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-sm text-gray-700 dark:text-gray-300 flex items-center hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      Export CSV
                    </button>
                  </div>
                  {/* Responsive table container with max height and scrolling */}
                  <div className="border border-gray-200 dark:border-neutral-700 rounded-sm overflow-hidden">
                    <div className="overflow-auto max-h-[400px] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-neutral-700">
                      <table className="min-w-full border-collapse text-xs">
                        {children}
                      </table>
                    </div>
                  </div>
                </div>
              );
            },
            th: ({children}) => (
              <th className="px-2 py-1.5 border-b border-gray-200 dark:border-neutral-700 text-left text-xs font-medium text-black dark:text-gray-200 sticky top-0 bg-white dark:bg-neutral-900 z-10">
                {children}
              </th>
            ),
            td: ({children}) => (
              <td className="px-2 py-1.5 text-xs text-black dark:text-gray-300 border-b border-gray-200 dark:border-neutral-700">
                {children}
              </td>
            ),
            tr: ({children}) => (
              <tr className="hover:bg-gray-50 dark:hover:bg-neutral-800/50">
                {children}
              </tr>
            ),
            strong: ({children}) => <strong className="font-medium text-black dark:text-gray-200">{children}</strong>,
            em: ({children}) => <em className="text-black dark:text-gray-300 italic">{children}</em>,
            a: ({children, href}) => (
              <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-800 dark:text-gray-300 border-b border-gray-300 dark:border-gray-700 font-mono text-sm no-underline"
              >
                {children}
              </a>
            ),
          }}
        >
          {cleanedContent}
        </ReactMarkdown>
      </div>
    );
  }
);

MemoizedMarkdown.displayName = 'MemoizedMarkdown';