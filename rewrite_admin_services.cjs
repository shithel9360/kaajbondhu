const fs = require('fs');
let admin = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

// 1. Fix state definition
admin = admin.replace(
  "const [newService, setNewService] = useState({ name: '', description: '', base_price: '', category_id: '', is_active: true });",
  "const [newService, setNewService] = useState({ name: '', description: '', base_price: '', category_id: '', is_active: true, discount_percentage: 0, offer_text: '' });"
);

// 2. Fix handleEditClick
admin = admin.replace(
  "is_active: service.is_active",
  "is_active: service.is_active,\n      discount_percentage: service.discount_percentage || 0,\n      offer_text: service.offer_text || ''"
);

// 3. Fix handleSaveService payload
admin = admin.replace(
  "base_price: parseFloat(newService.base_price),",
  "base_price: parseFloat(newService.base_price),\n        discount_percentage: parseInt(newService.discount_percentage.toString()) || 0,\n        offer_text: newService.offer_text,"
);

// 4. Fix resets
admin = admin.replace(
  /setNewService\(\{ name: '', description: '', base_price: '', category_id: '', is_active: true \}\)/g,
  "setNewService({ name: '', description: '', base_price: '', category_id: '', is_active: true, discount_percentage: 0, offer_text: '' })"
);

// 5. Form changes: Add discount inputs
const oldDesc = `<div className="space-y-2 md:col-span-2">
                      <Label>সার্ভিসের বিবরণ</Label>
                      <textarea required value={newService.description} onChange={(e) => setNewService({...newService, description: e.target.value})} className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} />
                    </div>`;
                    
const newDescAndDiscounts = `<div className="space-y-2 md:col-span-2">
                      <Label>সার্ভিসের বিবরণ</Label>
                      <textarea required value={newService.description} onChange={(e) => setNewService({...newService, description: e.target.value})} className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} />
                    </div>
                    <div className="space-y-2">
                      <Label>ডিসকাউন্ট (%)</Label>
                      <Input type="number" min="0" max="100" value={newService.discount_percentage} onChange={(e) => setNewService({...newService, discount_percentage: parseInt(e.target.value) || 0})} placeholder="যেমন: 10" />
                    </div>
                    <div className="space-y-2">
                      <Label>অফার টেক্সট (ঐচ্ছিক)</Label>
                      <Input value={newService.offer_text} onChange={(e) => setNewService({...newService, offer_text: e.target.value})} placeholder="যেমন: ঈদ উপলক্ষে ১০% ছাড়!" />
                    </div>`;

admin = admin.replace(oldDesc, newDescAndDiscounts);

// Wait, maybe the oldDesc doesn't match exactly because of previous script. Let me find and replace based on simpler regex
admin = admin.replace(
  /<div className="space-y-2 md:col-span-2">\s*<Label>সার্ভিসের বিবরণ<\/Label>\s*<textarea[^>]*><\/textarea>\s*<\/div>/g,
  newDescAndDiscounts
);

// 6. Fix table columns for Services
// Make sure "অ্যাকশন" td has Edit and Delete buttons!
const rowPattern = /<td className="p-4 text-center">\s*\{s\.is_active \?[\s\S]*?<\/span>\s*\}\s*<\/td>\s*<td className="p-4 text-right">[\s\S]*?<\/td>/;
const fixedRow = `<td className="p-4 text-center">
                          {s.is_active ? 
                            <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">অ্যাকটিভ</span> : 
                            <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">নিষ্ক্রিয়</span>
                          }
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditClick(s)}>এডিট</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteService(s.id)}>ডিলিট</Button>
                          </div>
                        </td>`;
admin = admin.replace(rowPattern, fixedRow);

fs.writeFileSync('src/pages/AdminDashboard.tsx', admin);
console.log('Fixed services edit in AdminDashboard');
