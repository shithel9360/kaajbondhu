const fs = require('fs');
let admin = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

// Add state for selected provider modal
admin = admin.replace(
  "const [allBookings, setAllBookings] = useState<any[]>([]);",
  `const [allBookings, setAllBookings] = useState<any[]>([]);
  const [selectedProviderDetail, setSelectedProviderDetail] = useState<any>(null);`
);

// Add the "View Details" button to the Actions column
const actionsColBefore = `{p.status === 'pending_approval' && (
                            <div className="flex justify-end gap-2">
                              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleApproveProvider(p.id)}>
                                <CheckCircle2 className="w-4 h-4 mr-1" /> গ্রহণ
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleRejectProvider(p.id)}>
                                <XCircle className="w-4 h-4 mr-1" /> বাতিল
                              </Button>
                            </div>
                          )}`;

const actionsColAfter = `<div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => setSelectedProviderDetail(p)}>
                              বিস্তারিত
                            </Button>
                            {p.status === 'pending_approval' && (
                              <>
                                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleApproveProvider(p.id)}>
                                  <CheckCircle2 className="w-4 h-4 mr-1" /> গ্রহণ
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleRejectProvider(p.id)}>
                                  <XCircle className="w-4 h-4 mr-1" /> বাতিল
                                </Button>
                              </>
                            )}
                          </div>`;

admin = admin.replace(actionsColBefore, actionsColAfter);

// Add the Modal at the bottom of the component
const modalHTML = `
      {/* Provider Details Modal */}
      {selectedProviderDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">প্রোভাইডার বিস্তারিত তথ্য</h2>
              <button onClick={() => setSelectedProviderDetail(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><XCircle className="w-6 h-6" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">নাম</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{selectedProviderDetail.profile?.full_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">ফোন নম্বর</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{selectedProviderDetail.profile?.phone_number}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">সার্ভিস ক্যাটাগরি</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{selectedProviderDetail.skill?.categories?.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">অভিজ্ঞতা</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{selectedProviderDetail.skill?.experience_years} বছর</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-slate-100">ঠিকানা</h3>
                <p className="text-sm"><span className="text-slate-500">বর্তমান:</span> {selectedProviderDetail.present_address}</p>
                <p className="text-sm"><span className="text-slate-500">স্থায়ী:</span> {selectedProviderDetail.permanent_address}</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 bg-red-50/50 dark:bg-red-900/10 p-4 rounded-xl">
                <h3 className="font-bold text-red-700 dark:text-red-400">ইমার্জেন্সি কন্টাক্ট</h3>
                <div className="grid grid-cols-2 gap-4">
                  <p className="text-sm"><span className="text-slate-500">নাম:</span> {selectedProviderDetail.emergency_contact_name}</p>
                  <p className="text-sm"><span className="text-slate-500">সম্পর্ক:</span> {selectedProviderDetail.emergency_contact_relation}</p>
                  <p className="text-sm"><span className="text-slate-500">ফোন:</span> {selectedProviderDetail.emergency_contact_phone}</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-slate-100">এনআইডি (NID: {selectedProviderDetail.nid_number})</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-2">সামনের অংশ</p>
                    {selectedProviderDetail.nid_front_url ? (
                      <a href={selectedProviderDetail.nid_front_url} target="_blank" rel="noreferrer">
                        <img src={selectedProviderDetail.nid_front_url} alt="NID Front" className="w-full h-32 object-cover rounded-lg border border-slate-200 dark:border-slate-700 hover:opacity-80 transition-opacity" />
                      </a>
                    ) : <div className="w-full h-32 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">No Image</div>}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-2">পেছনের অংশ</p>
                    {selectedProviderDetail.nid_back_url ? (
                      <a href={selectedProviderDetail.nid_back_url} target="_blank" rel="noreferrer">
                        <img src={selectedProviderDetail.nid_back_url} alt="NID Back" className="w-full h-32 object-cover rounded-lg border border-slate-200 dark:border-slate-700 hover:opacity-80 transition-opacity" />
                      </a>
                    ) : <div className="w-full h-32 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">No Image</div>}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSelectedProviderDetail(null)}>বন্ধ করুন</Button>
              {selectedProviderDetail.status === 'pending_approval' && (
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => { handleApproveProvider(selectedProviderDetail.id); setSelectedProviderDetail(null); }}>
                  অ্যাপ্রুভ করুন
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;

admin = admin.replace(
  "    </div>\n  );\n}",
  modalHTML
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', admin);
console.log('Provider details modal added to AdminDashboard');
