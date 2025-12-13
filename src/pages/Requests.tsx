import { Header } from "@/components/layout/header";
import { formatDateWithOffset } from "@/lib/utils";
import { Footer } from "@/components/layout/footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useVerificationStore } from "@/stores/useVerificationStore";
import { Link } from "react-router-dom";
import { ExternalLink, CheckCircle, Clock, XCircle, FileText, User } from "lucide-react";

export default function Requests() {
  const { requests } = useVerificationStore();
  const safeRequests = requests || [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Header />

      {/* Page Header Area */}
      <div className="bg-white border-b border-slate-200 mb-8">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                  <Clock className="w-8 h-8 text-blue-600" />
                  Request History
                </h1>
                <p className="text-slate-500 mt-2 text-lg">
                  Track status and access verified student records.
                </p>
              </div>
              <Link to="/registry">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                  + New Verification
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 pb-12">
        <div className="max-w-4xl mx-auto">

          <div className="grid gap-4">
            {safeRequests.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="font-bold text-lg mb-2">No Requests Found</h3>
                <p className="text-slate-500 mb-6">You haven't requested any credentials yet.</p>
                <Link to="/registry">
                  <Button>Search Registry</Button>
                </Link>
              </div>
            ) : (
              safeRequests.map(req => (
                <div key={req.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-5 items-start sm:items-center hover:border-blue-200 transition-colors">

                  {/* Icon */}
                  <div className="bg-slate-100 p-3 rounded-lg hidden sm:block">
                    <User className="w-6 h-6 text-slate-500" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-lg text-slate-900 truncate">{req.studentName}</h3>
                      <StatusBadge status={req.status} />
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500">
                      <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">{req.studentEnrlNo}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {formatDateWithOffset(req.timestamp)}</span>
                      <span>Purpose: <span className="font-medium text-slate-700">{req.purpose}</span></span>
                    </div>

                    {req.status === 'approved' && (
                      <div className="mt-2 text-xs text-green-700 font-medium flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Access Granted: {(req.approvedFields || []).length} Items
                        </div>
                        <div className="pl-4.5 text-slate-500 line-clamp-1">
                          {(req.approvedFields || []).join(", ")}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 w-full sm:w-auto">
                    {req.status === 'approved' ? (
                      <Link to={`/verify/${req.studentEnrlNo}`}>
                        <Button className="w-full sm:w-auto bg-white border border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 hover:border-green-300">
                          View Full Report <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    ) : req.status === 'rejected' ? (
                      <Button variant="ghost" disabled className="w-full sm:w-auto text-red-400">
                        Access Denied
                      </Button>
                    ) : (
                      <Button variant="ghost" disabled className="w-full sm:w-auto text-yellow-500 bg-yellow-50/50">
                        Awaiting Student
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'approved') return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-2.5 py-0.5 font-medium text-xs">Approved</Badge>;
  if (status === 'pending') return <Badge className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50 border border-yellow-100 px-2.5 py-0.5 font-medium text-xs">Pending</Badge>;
  return <Badge className="bg-red-50 text-red-700 hover:bg-red-50 border border-red-100 px-2.5 py-0.5 font-medium text-xs">Declined</Badge>;
}
