// Basic product search tool

export const productSearch = {
  name: 'productSearch',
  description: 'Search for products by name or category',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The search query for products',
      },
      category: {
        type: 'string',
        description: 'Optional category to filter by',
      }
    },
    required: ['query'],
  },
  execute: async ({ query, category }: { query: string; category?: string }) => {
    // Simulate API call with timeout
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock data
    const products = [
      { id: 1, name: 'Smartphone X', category: 'Electronics', price: 899, rating: 4.5 },
      { id: 2, name: 'Wireless Headphones', category: 'Electronics', price: 199, rating: 4.2 },
      { id: 3, name: 'Running Shoes', category: 'Sports', price: 129, rating: 4.7 },
      { id: 4, name: 'Coffee Maker', category: 'Kitchen', price: 89, rating: 4.1 },
      { id: 5, name: 'Laptop Pro', category: 'Electronics', price: 1299, rating: 4.8 },
    ];
    
    // Filter by query and category
    const results = products.filter(product => {
      const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = !category || product.category.toLowerCase() === category.toLowerCase();
      return matchesQuery && matchesCategory;
    });
    
    return {
      products: results,
      count: results.length,
      query,
      category: category || 'All'
    };
  }
};