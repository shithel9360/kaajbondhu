const fs = require('fs');
let admin = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

admin = admin.replace(
  "const [newService, setNewService] = useState({ name: '', description: '', base_price: '', category_id: '' });",
  "const [newService, setNewService] = useState({ name: '', description: '', base_price: '', category_id: '', is_active: true });"
);

admin = admin.replace(
  "setNewService({ name: '', description: '', base_price: '', category_id: '' });",
  "setNewService({ name: '', description: '', base_price: '', category_id: '', is_active: true });"
);

admin = admin.replace(
  "category_id: newService.category_id,",
  "category_id: newService.category_id,\n        is_active: newService.is_active,"
);
admin = admin.replace(
  "category_id: newService.category_id,",
  "category_id: newService.category_id,\n        is_active: newService.is_active,"
);

admin = admin.replace(
  "category_id: service.category_id",
  "category_id: service.category_id,\n      is_active: service.is_active"
);

// Add the checkbox to the form UI
admin = admin.replace(
  '<div className="pt-2 flex justify-end gap-2">',
  `<div className="space-y-2 flex flex-row items-center gap-2">
                      <input type="checkbox" id="is_active" checked={newService.is_active} onChange={e => setNewService({...newService, is_active: e.target.checked})} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600" />
                      <Label htmlFor="is_active" className="dark:text-slate-300 !mt-0">সার্ভিসটি কি বর্তমানে অ্যাকটিভ?</Label>
                    </div>
                    <div className="pt-2 flex justify-end gap-2">`
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', admin);
console.log('Added active toggle');
