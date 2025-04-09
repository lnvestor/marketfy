// This component shows a loading state while the chat interface is being loaded
export default function ChatLoading() {
  return (
    <div className="flex flex-col h-[600px] w-full max-w-4xl mx-auto border rounded-lg shadow-md animate-pulse">
      <div className="bg-gray-100 p-4 border-b">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/5"></div>
      </div>
      
      <div className="flex-1 p-4 space-y-4">
        <div className="h-10 bg-gray-200 rounded-lg w-3/4"></div>
        <div className="h-10 bg-gray-200 rounded-lg w-1/2 ml-auto"></div>
        <div className="h-10 bg-gray-200 rounded-lg w-2/3"></div>
      </div>
      
      <div className="p-4 border-t flex gap-2">
        <div className="flex-1 h-10 bg-gray-200 rounded"></div>
        <div className="w-16 h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}