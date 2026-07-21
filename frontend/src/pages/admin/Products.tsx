import { useAdminProductsQuery, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../../hooks/api/useProducts';
import { useState, useMemo } from 'react';
import { useAiInventoryAlerts } from '../../hooks/api/useAi';
import { useBranchStore } from '../../store/useBranchStore';
import { Button } from '../../components/ui/Button';
import { AnimatedSection } from '../../components/ui/AnimatedSection';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Edit2, Trash2 } from 'lucide-react';
import type { ProductDto } from '../../api/types';

export const AdminProducts = () => {
  const { selectedBranchId } = useBranchStore();
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: pageData } = useAdminProductsQuery(page, searchQuery ? 1000 : 10);
  const products = pageData?.content || [];
  const { data: inventoryAlerts, isLoading: isAlertsLoading } = useAiInventoryAlerts(selectedBranchId);
  
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDto | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductDto | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    price: '',
    stockQuantity: '',
    type: 'RETAIL',
  });

  const filteredProducts = useMemo(() => {
    return products.filter((product: any) => {
      const name = product.name.toLowerCase();
      const sku = product.sku.toLowerCase();
      const q = searchQuery.toLowerCase();
      return name.includes(q) || sku.includes(q);
    });
  }, [products, searchQuery]);

  const handleOpenModal = (product?: ProductDto) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        description: (product as any).description || '',
        price: product.price?.toString() || '',
        stockQuantity: (product as any).stockQuantity?.toString() || '',
        type: (product as any).type || 'RETAIL',
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '', sku: '', description: '', price: '', stockQuantity: '', type: 'RETAIL'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<ProductDto> = { 
      name: formData.name,
      sku: formData.sku,
      description: formData.description,
      price: Number(formData.price),
      type: formData.type,
      ...(formData.stockQuantity !== '' && { stockQuantity: Number(formData.stockQuantity) })
    } as any;

    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, data: payload }, {
        onSuccess: () => setIsModalOpen(false)
      });
    } else {
      createProduct.mutate(payload, {
        onSuccess: () => setIsModalOpen(false)
      });
    }
  };

  const confirmDelete = () => {
    if (productToDelete?.id) {
      deleteProduct.mutate(productToDelete.id, {
        onSuccess: () => setIsDeleteDialogOpen(false)
      });
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h1 className="font-display-md text-4xl text-on-surface mb-2">Inventory Management</h1>
          <p className="font-body-lg text-on-surface-variant">Manage retail and backbar products.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative group w-full md:w-64">
            <Input 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<span className="material-symbols-outlined">search</span>}
            />
            <div className="absolute top-full left-0 mt-2 p-2 bg-surface-container-high rounded text-on-surface-variant font-label-sm shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-full text-center border border-outline-variant/30">
              Local search: retrieving extended results for filtering.
            </div>
          </div>
          <Button onClick={() => handleOpenModal()} className="shadow-[0px_8px_20px_rgba(212,175,55,0.2)] shrink-0">
            <span className="material-symbols-outlined font-light mr-2">add_box</span>
            Add Product
          </Button>
        </div>
      </header>

      {!isAlertsLoading && inventoryAlerts && inventoryAlerts.length > 0 && (
        <AnimatedSection className="mb-8">
          <div className="bg-error/10 border border-error/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4 text-error">
              <span className="material-symbols-outlined">warning</span>
              <h3 className="font-display-sm text-xl text-on-surface">AI Inventory Alerts</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inventoryAlerts.map(alert => (
                <div key={alert.productId} className="bg-surface p-4 rounded-xl shadow-sm border border-error/10">
                  <h4 className="font-label-md text-on-surface mb-2">{alert.productName}</h4>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-on-surface-variant">Current Stock:</span>
                    <span className="font-bold text-error">{alert.currentStock}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-on-surface-variant">Reorder Level:</span>
                    <span>{alert.reorderLevel}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Est. Days Left:</span>
                    <span className="font-bold">{alert.estimatedDaysRemaining} days</span>
                  </div>
                  <Button variant="outline" className="w-full mt-4 h-8 text-xs">Reorder Now</Button>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      )}

      <AnimatedSection>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30">
                <th className="p-4 font-label-md text-on-surface-variant">Product</th>
                <th className="p-4 font-label-md text-on-surface-variant">Category</th>
                <th className="p-4 font-label-md text-on-surface-variant">Price</th>
                <th className="p-4 font-label-md text-on-surface-variant">Stock</th>
                <th className="p-4 font-label-md text-on-surface-variant">Status</th>
                <th className="p-4 font-label-md text-on-surface-variant text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p: any) => (
                <tr key={p.id} className="border-b border-outline-variant/30 hover:bg-surface-container-low transition-colors">
                  <td className="p-4 py-5">
                    <div className="font-label-lg text-on-surface">{p.name}</div>
                    {p.sku && <div className="font-body-sm text-on-surface-variant text-xs mt-1">SKU: {p.sku}</div>}
                  </td>
                  <td className="p-4 text-on-surface-variant capitalize">{p.type?.replace('_', ' ').toLowerCase() || 'N/A'}</td>
                  <td className="p-4 text-on-surface font-label-md">₹{p.price?.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-label-sm ${
                      p.stockQuantity > 20 ? 'bg-green-500/20 text-green-400' :
                      p.stockQuantity > 0 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {p.stockQuantity ?? 0} in stock
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-block w-2 h-2 rounded-full ${p.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleOpenModal(p)}
                      className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => { setProductToDelete(p); setIsDeleteDialogOpen(true); }}
                      className="p-2 text-error hover:bg-error/10 rounded-full transition-colors ml-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 p-4 border-t border-outline-variant/20 bg-surface/30 flex justify-between items-center rounded-2xl">
          <Button 
            variant="outline" 
            disabled={page === 0} 
            onClick={() => setPage(p => Math.max(0, p - 1))}
          >
            Previous
          </Button>
          <span className="text-on-surface-variant font-label-md">
            Page {pageData ? pageData.pageNo + 1 : 1} of {pageData ? pageData.totalPages : 1}
          </span>
          <Button 
            variant="outline" 
            disabled={pageData ? pageData.last : true} 
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      </AnimatedSection>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProduct ? "Edit Product" : "Add Product"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Product Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="SKU" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} required />
            <div className="space-y-1">
              <label className="text-sm font-medium text-on-surface">Type</label>
              <select 
                className="w-full h-[52px] px-4 rounded-xl border border-outline-variant bg-surface"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
                required
              >
                <option value="RETAIL">Retail</option>
                <option value="BACKBAR">Backbar</option>
              </select>
            </div>
          </div>
          <Input label="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price" type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
            <Input label="Stock Quantity" type="number" value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: e.target.value})} />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending}>Save</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} title="Remove Product">
        <div className="mb-6">
          <p>Are you sure you want to remove <strong>{productToDelete?.name}</strong>?</p>
          <p className="text-sm text-on-surface-variant mt-2">This will deactivate the product but retain transaction history.</p>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} className="bg-error hover:bg-error/90 text-white border-none" disabled={deleteProduct.isPending}>Yes, Remove</Button>
        </div>
      </Modal>
    </div>
  );
};
