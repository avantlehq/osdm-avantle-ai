export default function AgentShellPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">OSDM Agent Shell</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Dependency Engine Status</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Scanner Status:</span>
              <span className="text-green-600">✓ Active</span>
            </div>
            <div className="flex justify-between">
              <span>Security Analysis:</span>
              <span className="text-green-600">✓ Available</span>
            </div>
            <div className="flex justify-between">
              <span>License Compliance:</span>
              <span className="text-green-600">✓ Available</span>
            </div>
            <div className="flex justify-between">
              <span>Report Generation:</span>
              <span className="text-green-600">✓ Available</span>
            </div>
          </div>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">API Endpoints</h2>
          <div className="space-y-1 text-sm font-mono">
            <div>POST /api/v1/engine/scan</div>
            <div>POST /api/v1/engine/analyze</div>
            <div>POST /api/v1/report/security</div>
            <div>POST /api/provision</div>
          </div>
        </div>
      </div>
    </div>
  );
}