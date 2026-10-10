export interface CatalogTreeItem {
  _id: string;
  name: string;
  slug: string;
  subcategories: Array<{
    _id: string;
    name: string;
    slug: string;
    products: Array<{
      _id: string;
      name: string;
      slug: string;
      image: string;
    }>;
  }>;
}

export interface CatalogTreeData {
  tree: Record<string, CatalogTreeItem>;
}

let catalogTreePromise: Promise<CatalogTreeData> | null = null;

export async function fetchCatalogTreeClient(): Promise<CatalogTreeData> {
  if (!catalogTreePromise) {
    catalogTreePromise = fetch("/api/catalog-tree")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load catalog tree");
        return res.json() as Promise<CatalogTreeData>;
      })
      .catch((err) => {
        catalogTreePromise = null;
        throw err;
      });
  }
  return catalogTreePromise;
}
