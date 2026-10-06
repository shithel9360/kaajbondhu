const fs = require('fs');
let admin = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

// Imports
admin = admin.replace(
  "import { Users, Activity, Wallet, Plus, Server, UserCheck, CheckCircle2, XCircle } from 'lucide-react';",
  "import { Users, Activity, Wallet, Plus, Server, UserCheck, CheckCircle2, XCircle, Pencil, Trash } from 'lucide-react';"
);

// State additions
admin = admin.replace(
  "const [isAddingService, setIsAddingService] = useState(false);",
  `const [isAddingService, setIsAddingService] = useState(false);
  const [editModeId, setEditModeId] = useState<string | null>(null);`
);

// handleSaveService replacement
admin = admin.replace(
  /const handleAddService = async \(e: React\.FormEvent\) => \{[\s\S]*?^\s*\};/m,
  `const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editModeId) {
      const { error } = await supabase.from('services').update({
        name: newService.name,
        description: newService.description,
        base_price: parseInt(newService.base_price),
        category_id: newService.category_id,
      }).eq('id', editModeId);

      if (!error) {
        alert('সার্ভিস সফলভাবে আপডেট করা হয়েছে!');
        window.location.reload();
      } else {
        alert('সমস্যা হয়েছে: ' + error.message);
      }
    } else {
      const { error } = await supabase.from('services').insert({
        name: newService.name,
        description: newService.description,
        base_price: parseInt(newService.base_price),
        category_id: newService.category_id,
        pricing_model: 'starting_at'
      });

      if (!error) {
        alert('সার্ভিস সফলভাবে যোগ করা হয়েছে!');
        window.location.reload();
      } else {
        alert('সমস্যা হয়েছে: ' + error.message);
      }
    }
  };

  const handleEditClick = (service: any) => {
    setNewService({
      name: service.name,
      description: service.description || '',
      base_price: service.base_price.toString(),
      category_id: service.category_id
    });
    setEditModeId(service.id);
    setIsAddingService(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই সার্ভিসটি মুছে ফেলতে চান?')) return;
    
    const { error } = await supabase.from('services').update({ archived_at: new Date().toISOString() }).eq('id', serviceId);
    if (!error) {
      alert('সার্ভিস মুছে ফেলা হয়েছে।');
      setServices(services.filter(s => s.id !== serviceId));
    } else {
      alert('সমস্যা হয়েছে: ' + error.message);
    }
  };`
);

// form submission handler
admin = admin.replace(
  "onSubmit={handleAddService}",
  "onSubmit={handleSaveService}"
);

// add service button text
admin = admin.replace(
  "onClick={() => setIsAddingService(!isAddingService)}",
  "onClick={() => { setIsAddingService(!isAddingService); setEditModeId(null); setNewService({ name: '', description: '', base_price: '', category_id: '' }); }}"
);

// Table headers
admin = admin.replace(
  '<th className="p-4 text-right">স্ট্যাটাস</th>',
  '<th className="p-4 text-center">স্ট্যাটাস</th>\n<th className="p-4 text-right">অ্যাকশন</th>'
);

// Table rows
admin = admin.replace(
  /<td className="p-4 text-right">[\s\S]*?<\/td>/g,
  `<td className="p-4 text-center">
                      {s.is_active ? 
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">অ্যাকটিভ</span> : 
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">নিষ্ক্রিয়</span>
                      }
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditClick(s)} className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteService(s.id)}>
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>`
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', admin);
console.log('Admin CRUD successfully patched.');
