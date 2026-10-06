const fs = require('fs');
let admin = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

// 1. Update newService state
admin = admin.replace(
  "const [newService, setNewService] = useState({ name: '', description: '', base_price: '', category_id: '', is_active: true });",
  "const [newService, setNewService] = useState({ name: '', description: '', base_price: '', category_id: '', is_active: true, discount_percentage: 0, offer_text: '' });"
);

// 2. Add handleEditService function
const editFunc = `  const handleEditService = (s: any) => {
    setEditModeId(s.id);
    setNewService({ 
      name: s.name, 
      description: s.description, 
      base_price: s.base_price.toString(), 
      category_id: s.category_id, 
      is_active: s.is_active,
      discount_percentage: s.discount_percentage || 0,
      offer_text: s.offer_text || ''
    });
    setIsAddingService(true);
    // scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
`;
admin = admin.replace(
  "const handleAddService = async (e: React.FormEvent) => {",
  editFunc + "\n  const handleAddService = async (e: React.FormEvent) => {"
);

// 3. Update handleAddService payload
admin = admin.replace(
  "base_price: parseFloat(newService.base_price),",
  "base_price: parseFloat(newService.base_price),\n        discount_percentage: parseInt(newService.discount_percentage.toString()) || 0,\n        offer_text: newService.offer_text,"
);

// 4. Update the resets
admin = admin.replace(
  /setNewService\(\{ name: '', description: '', base_price: '', category_id: '', is_active: true \}\)/g,
  "setNewService({ name: '', description: '', base_price: '', category_id: '', is_active: true, discount_percentage: 0, offer_text: '' })"
);

// 5. Add discount fields to the form
const descHtml = `<div className="space-y-2 md:col-span-2">
                      <Label>সার্ভিসের বিবরণ</Label>
                      <textarea required value={newService.description} onChange={(e) => setNewService({...newService, description: e.target.value})} className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} />
                    </div>`;

const newFields = `${descHtml}
                    <div className="space-y-2">
                      <Label>ডিসকাউন্ট (%)</Label>
                      <Input type="number" min="0" max="100" value={newService.discount_percentage} onChange={(e) => setNewService({...newService, discount_percentage: parseInt(e.target.value) || 0})} placeholder="যেমন: 10" />
                    </div>
                    <div className="space-y-2">
                      <Label>অফার টেক্সট (ঐচ্ছিক)</Label>
                      <Input value={newService.offer_text} onChange={(e) => setNewService({...newService, offer_text: e.target.value})} placeholder="যেমন: ঈদ উপলক্ষে ১০% ছাড়!" />
                    </div>`;

admin = admin.replace(
  /<div className="space-y-2 md:col-span-2">\s*<Label>সার্ভিসের বিবরণ<\/Label>\s*<textarea required value=\{newService\.description\}[^>]*><\/textarea>\s*<\/div>/,
  newFields
);

// If the regex above failed because textarea doesn't have closing tag in one line, let's use string replace:
const oldDesc = `<div className="space-y-2 md:col-span-2">
                      <Label>সার্ভিসের বিবরণ</Label>
                      <textarea required value={newService.description} onChange={(e) => setNewService({...newService, description: e.target.value})} className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm shadow-sm" rows={2} />
                    </div>`;
                    
admin = admin.replace(oldDesc, newFields);

// 6. Fix the table headers and body for Services!
// Headers already have "স্ট্যাটাস" and "অ্যাকশন"
// Body has 4 columns:
const oldRowEnd = `<td className="p-4 text-right">
                          {s.is_active ? 
                            <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">অ্যাকটিভ</span> : 
                            <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">নিষ্ক্রিয়</span>
                          }
                        </td>`;

const newRowEnd = `<td className="p-4 text-center">
                          {s.is_active ? 
                            <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">অ্যাকটিভ</span> : 
                            <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">নিষ্ক্রিয়</span>
                          }
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditService(s)}>এডিট</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteService(s.id)}>ডিলিট</Button>
                          </div>
                        </td>`;

admin = admin.replace(oldRowEnd, newRowEnd);

// Also need to show discount next to base price if it exists
admin = admin.replace(
  "{formatBDT(s.base_price)}",
  "{formatBDT(s.base_price)}\n                          {s.discount_percentage > 0 && <span className=\"block text-xs text-red-500 font-normal\">-{s.discount_percentage}% ছাড়</span>}"
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', admin);
console.log('AdminDashboard services updated');
