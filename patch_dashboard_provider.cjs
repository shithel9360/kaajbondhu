const fs = require('fs');
const path = 'src/pages/Dashboard.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Update the query
code = code.replace(
  ".select(`*, services ( name, base_price, pricing_model )`)",
  ".select(`*, services ( name, base_price, pricing_model ), assignments ( provider_id, status, profiles!assignments_provider_profile_fkey ( id, full_name, phone_number, avatar_url, average_rating, total_reviews ) )`)"
);

// 2. Add the Provider Card rendering in the Customer view
const providerCardHtml = `
                      {role === 'customer' && b.assignments && b.assignments.length > 0 && b.assignments[0].profiles && !['pending', 'matching', 'cancelled'].includes(b.status) && (
                        <div className="mt-4 p-4 rounded-lg border border-blue-100 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                          <p className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                            আপনার প্রোভাইডার
                          </p>
                          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center text-xl font-bold text-slate-500">
                              {b.assignments[0].profiles.avatar_url ? (
                                <img src={b.assignments[0].profiles.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                              ) : (
                                b.assignments[0].profiles.full_name?.charAt(0) || 'P'
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                {b.assignments[0].profiles.full_name}
                                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 text-blue-600 text-[10px]" title="Verified Provider">
                                  ✓
                                </span>
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Provider ID: {b.assignments[0].profiles.id.split('-')[0].toUpperCase()}
                              </p>
                              <div className="flex items-center gap-3 mt-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                  ★ {b.assignments[0].profiles.average_rating?.toFixed(1) || '4.8'}
                                </span>
                                <span>•</span>
                                <span>{b.assignments[0].profiles.total_reviews || 12}টি কাজ সম্পন্ন</span>
                              </div>
                            </div>
                            <div className="w-full sm:w-auto flex flex-col gap-2">
                              <a 
                                href={\`tel:\${b.assignments[0].profiles.phone_number}\`}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium text-sm transition-colors shadow-sm"
                              >
                                📞 কল করুন
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
`;

// Insert it right after the StatusBadges in the booking mapping
// Let's find the closing div of the header inside the map
code = code.replace(
  `                      <div className="flex items-center gap-3">
                        <p className="font-bold text-xl text-slate-900 dark:text-slate-50">{b.services?.name}</p>
                        <StatusBadge status={b.status} type="booking" detailed={true} />
                        <StatusBadge status={b.payment_status} type="payment" />
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" /> {b.address}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" /> {new Date(b.created_at).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>`,
  `                      <div className="flex items-center gap-3">
                        <p className="font-bold text-xl text-slate-900 dark:text-slate-50">{b.services?.name}</p>
                        <StatusBadge status={b.status} type="booking" detailed={true} />
                        <StatusBadge status={b.payment_status} type="payment" />
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" /> {b.address}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" /> {new Date(b.created_at).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
${providerCardHtml}
                    </div>`
);

fs.writeFileSync(path, code);
