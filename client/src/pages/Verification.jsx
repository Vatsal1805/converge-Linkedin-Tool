import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  RefreshCw, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Filter,
  FileSpreadsheet,
  Building2,
  Phone,
  Globe,
  HelpCircle
} from 'lucide-react';

export default function Verification() {
  const [daysWindow, setDaysWindow] = useState('14');
  const [summaryData, setSummaryData] = useState(null);
  const [needsReviewLeads, setNeedsReviewLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reverifying, setReverifying] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionSuccess, setActionSuccess] = useState(null);

  useEffect(() => {
    fetchData();
  }, [daysWindow]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, revRes] = await Promise.all([
        fetch(`http://localhost:5000/api/verification/summary?days=${daysWindow}`),
        fetch('http://localhost:5000/api/verification/needs-review')
      ]);

      const sumJson = await sumRes.json();
      const revJson = await revRes.json();

      if (sumJson.success) setSummaryData(sumJson);
      if (revJson.success) setNeedsReviewLeads(revJson.leads || []);
    } catch (err) {
      console.error('Error fetching verification data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (leadId, businessName) => {
    try {
      const res = await fetch(`http://localhost:5000/api/verification/approve/${leadId}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(`Approved & synced "${businessName}" to Google Sheets!`);
        fetchData();
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err) {
      console.error('Error approving lead:', err);
    }
  };

  const handleReverify = async () => {
    setReverifying(true);
    try {
      await fetch('http://localhost:5000/api/verification/reverify-all', { method: 'POST' });
      setActionSuccess('Re-verification cycle executed across all pending leads!');
      fetchData();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      console.error('Error re-verifying:', err);
    } finally {
      setReverifying(false);
    }
  };

  const metrics = summaryData?.metrics || {
    totalLeads: 0,
    passedCount: 0,
    partialCount: 0,
    failedCount: 0,
    passPercentage: '0.0',
    partialPercentage: '0.0',
    failPercentage: '0.0'
  };

  const failures = summaryData?.checkFailures || {
    places_api_match: 0,
    phone_valid: 0,
    website_reachable: 0,
    no_website_claim_verified: 0
  };

  const filteredReviewLeads = needsReviewLeads.filter(lead => {
    if (statusFilter === 'all') return true;
    return lead.verification_status === statusFilter;
  });

  return (
    <div className="p-8 space-y-8 bg-[#0A0A0C] min-h-screen text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#23232F] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-jakarta text-white tracking-tight">
                Automated Lead Verification Hub
              </h1>
              <p className="text-sm text-slate-400">
                Independent 4-check deterministic verifier testing Places API cross-checks, phone validity, site reachability, and Scenario 1 claims.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#121216] border border-[#23232F] rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Test Window:</span>
            <select 
              value={daysWindow} 
              onChange={(e) => setDaysWindow(e.target.value)}
              className="bg-transparent text-white font-mono font-medium focus:outline-none cursor-pointer"
            >
              <option value="7" className="bg-[#121216]">Last 7 Days</option>
              <option value="14" className="bg-[#121216]">Last 14 Days</option>
              <option value="30" className="bg-[#121216]">Last 30 Days</option>
            </select>
          </div>

          <button
            onClick={handleReverify}
            disabled={reverifying}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 shadow-lg shadow-emerald-950/40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reverifying ? 'animate-spin' : ''}`} />
            {reverifying ? 'Re-Verifying...' : 'Re-Verify Pending'}
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-xl text-xs font-mono flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121216] border border-[#23232F] rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>TOTAL TESTED LEADS</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-bold font-jakarta text-white">{metrics.totalLeads}</div>
          <div className="text-xs text-slate-500 mt-2">In last {daysWindow} days window</div>
        </div>

        <div className="bg-[#121216] border border-emerald-500/20 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono text-emerald-400 mb-2">
            <span>VERIFICATION PASSED</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold font-jakarta text-emerald-400">{metrics.passPercentage}%</div>
          <div className="text-xs text-slate-400 mt-2 font-mono">{metrics.passedCount} leads auto-pushed to Sheets</div>
        </div>

        <div className="bg-[#121216] border border-amber-500/20 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono text-amber-400 mb-2">
            <span>PARTIAL PASSED</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold font-jakarta text-amber-400">{metrics.partialPercentage}%</div>
          <div className="text-xs text-slate-400 mt-2 font-mono">{metrics.partialCount} leads held for review</div>
        </div>

        <div className="bg-[#121216] border border-rose-500/20 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono text-rose-400 mb-2">
            <span>VERIFICATION FAILED</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-bold font-jakarta text-rose-400">{metrics.failPercentage}%</div>
          <div className="text-xs text-slate-400 mt-2 font-mono">{metrics.failedCount} leads rejected</div>
        </div>
      </div>

      {/* 2-Column Section: Failure Breakdown & Accuracy Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Common Failure Checks */}
        <div className="bg-[#121216] border border-[#23232F] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#23232F] pb-4">
            <h3 className="text-sm font-semibold font-jakarta text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Check Failure Analysis (Prompt Tuning Insights)
            </h3>
            <span className="text-xs font-mono text-slate-500">4-Check Pipeline</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="bg-[#0A0A0C] border border-[#23232F] p-3 rounded-xl flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-slate-200 font-semibold flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  Places API Cross-Check Match
                </div>
                <div className="text-slate-500 text-[11px]">Failed when lead cannot be matched to active Google Maps place</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-amber-400">{failures.places_api_match} Fails</div>
                <div className="text-[10px] text-slate-500">
                  {metrics.totalLeads > 0 ? ((failures.places_api_match / metrics.totalLeads) * 100).toFixed(1) : 0}% of leads
                </div>
              </div>
            </div>

            <div className="bg-[#0A0A0C] border border-[#23232F] p-3 rounded-xl flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-slate-200 font-semibold flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  Structural Phone Validation
                </div>
                <div className="text-slate-500 text-[11px]">Failed when phone format is invalid for claimed country code</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-amber-400">{failures.phone_valid} Fails</div>
                <div className="text-[10px] text-slate-500">
                  {metrics.totalLeads > 0 ? ((failures.phone_valid / metrics.totalLeads) * 100).toFixed(1) : 0}% of leads
                </div>
              </div>
            </div>

            <div className="bg-[#0A0A0C] border border-[#23232F] p-3 rounded-xl flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-slate-200 font-semibold flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  Website Reachability (HTTP HEAD 5s)
                </div>
                <div className="text-slate-500 text-[11px]">Failed when claimed website is dead, non-2xx/3xx, or times out</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-amber-400">{failures.website_reachable} Fails</div>
                <div className="text-[10px] text-slate-500">
                  {metrics.totalLeads > 0 ? ((failures.website_reachable / metrics.totalLeads) * 100).toFixed(1) : 0}% of leads
                </div>
              </div>
            </div>

            <div className="bg-[#0A0A0C] border border-rose-500/20 p-3 rounded-xl flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-rose-300 font-semibold flex items-center gap-2">
                  <HelpCircle className="w-3.5 h-3.5 text-rose-400" />
                  "No Website" Claim Check (Scenario 1 Target)
                </div>
                <div className="text-slate-500 text-[11px]">Failed when lead claimed NO website, but Google Places actually has one</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-rose-400">{failures.no_website_claim_verified} Fails</div>
                <div className="text-[10px] text-slate-500">
                  {metrics.totalLeads > 0 ? ((failures.no_website_claim_verified / metrics.totalLeads) * 100).toFixed(1) : 0}% of leads
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 14-Day Accuracy Trend SVG Chart */}
        <div className="bg-[#121216] border border-[#23232F] rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#23232F] pb-4">
            <h3 className="text-sm font-semibold font-jakarta text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              14-Day Verification Trend Analytics
            </h3>
            <span className="text-xs font-mono text-emerald-400 font-semibold">
              {metrics.passPercentage}% Accuracy Rate
            </span>
          </div>

          {/* Simple Visual Bar Chart */}
          <div className="h-44 flex items-end justify-between gap-2 pt-4 px-2">
            {(summaryData?.trend || []).length > 0 ? (
              summaryData.trend.slice(-10).map((day, idx) => {
                const passH = day.total > 0 ? Math.round((day.passed / day.total) * 100) : 0;
                const failH = day.total > 0 ? Math.round(((day.partial + day.failed) / day.total) * 100) : 0;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-[#23232F] text-[10px] font-mono px-2 py-1 rounded-md text-white whitespace-nowrap z-20 pointer-events-none">
                      {day.date}: {day.passed} Passed / {day.partial + day.failed} Review
                    </div>

                    <div className="w-full bg-[#0A0A0C] border border-[#23232F] rounded-t-lg h-32 flex flex-col justify-end overflow-hidden p-0.5">
                      <div style={{ height: `${failH}%` }} className="w-full bg-rose-500/60 rounded-t-sm transition-all duration-300" />
                      <div style={{ height: `${passH}%` }} className="w-full bg-emerald-500 rounded-t-sm transition-all duration-300" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 truncate w-full text-center">
                      {day.date.split('-').slice(1).join('/')}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-mono text-slate-500">
                No trend data collected yet. Run a lead discovery job to start logging accuracy trends!
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-6 text-xs font-mono text-slate-400 pt-2 border-t border-[#23232F]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-sm" />
              <span>Passed (Synced to Sheet)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-rose-500/60 rounded-sm" />
              <span>Partial / Failed (Needs Review)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filterable "Needs Review" Table */}
      <div className="bg-[#121216] border border-[#23232F] rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#23232F] pb-4">
          <div>
            <h3 className="text-base font-semibold font-jakarta text-white flex items-center gap-2">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-400" />
              Leads Requiring Manual Review ({filteredReviewLeads.length})
            </h3>
            <p className="text-xs text-slate-400">
              Leads with <span className="text-amber-400 font-mono">partial</span> or <span className="text-rose-400 font-mono">failed</span> status are held here instead of being auto-pushed to Google Sheets.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">Filter Status:</span>
            {['all', 'partial', 'failed', 'pending'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg border capitalize transition-all ${
                  statusFilter === st 
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-semibold' 
                    : 'bg-[#0A0A0C] border-[#23232F] text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {filteredReviewLeads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-[#23232F] text-slate-400 font-mono text-[11px]">
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4">BUSINESS NAME</th>
                  <th className="py-3 px-4">NICHE & LOCATION</th>
                  <th className="py-3 px-4">PHONE & WEBSITE</th>
                  <th className="py-3 px-4">CHECKS FAILED</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#23232F]/50 text-slate-300">
                {filteredReviewLeads.map(lead => {
                  const isExpanded = expandedRow === lead.id;
                  let details = {};
                  try {
                    details = typeof lead.verification_details === 'string' ? JSON.parse(lead.verification_details) : (lead.verification_details || {});
                  } catch (e) {}

                  const failureReasons = details.failure_reasons || [];

                  return (
                    <React.Fragment key={lead.id}>
                      <tr className="hover:bg-[#1A1A22] transition-colors">
                        <td className="py-3.5 px-4 font-mono">
                          {lead.verification_status === 'partial' && (
                            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-md text-[10px] font-semibold">
                              PARTIAL
                            </span>
                          )}
                          {lead.verification_status === 'failed' && (
                            <span className="bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2.5 py-1 rounded-md text-[10px] font-semibold">
                              FAILED
                            </span>
                          )}
                          {lead.verification_status === 'pending' && (
                            <span className="bg-slate-500/10 text-slate-400 border border-slate-500/30 px-2.5 py-1 rounded-md text-[10px]">
                              PENDING
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <span>{lead.business_name}</span>
                            {lead.google_map_url && (
                              <a href={lead.google_map_url} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-indigo-400">
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div>{lead.niche}</div>
                          <div className="text-slate-500 text-[11px] font-mono">{lead.city_state}</div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          <div>{lead.phone_number || 'Unlisted'}</div>
                          <div className="text-slate-500 truncate max-w-[150px]">
                            {lead.website_url || 'NO WEBSITE'}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => setExpandedRow(isExpanded ? null : lead.id)}
                            className="text-amber-400 hover:underline font-mono text-[11px] flex items-center gap-1"
                          >
                            <span>{failureReasons.length} reason(s)</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleApprove(lead.id, lead.business_name)}
                            className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 px-3 py-1.5 rounded-lg font-mono text-[11px] transition-all flex items-center gap-1.5 ml-auto"
                          >
                            <FileSpreadsheet className="w-3 h-3" />
                            <span>Approve & Sync</span>
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Details Drawer */}
                      {isExpanded && (
                        <tr className="bg-[#0A0A0C]">
                          <td colSpan="6" className="p-4 border-b border-[#23232F]">
                            <div className="space-y-2 font-mono text-xs text-slate-300 bg-[#121216] border border-[#23232F] p-4 rounded-xl">
                              <div className="text-xs font-bold text-amber-400 flex items-center gap-2">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Specific Verification Failure Details:
                              </div>
                              <ul className="list-disc list-inside space-y-1 text-slate-400">
                                {failureReasons.map((reason, rIdx) => (
                                  <li key={rIdx}>{reason}</li>
                                ))}
                              </ul>
                              <div className="pt-2 text-[11px] text-slate-500">
                                Qualification Reason: {lead.qualification_reason}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 font-mono text-xs space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <div>No leads currently require manual review for status "{statusFilter}".</div>
            <div className="text-[11px] text-slate-600">All generated leads have passed 100% verification and auto-pushed to Google Sheets!</div>
          </div>
        )}
      </div>
    </div>
  );
}
