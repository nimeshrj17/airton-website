import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://alvwqkqsokaiarrmweht.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsdndxa3Fzb2thaWFycm13ZWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzOTcyNjQsImV4cCI6MjA5ODk3MzI2NH0.fR2O_DvLGcDxUC3Ld4DrRafKJH4kEJhCUScswKaUKfA';

// Initialize Supabase only if env vars are present
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (!supabase) {
    return res.status(500).json({ error: 'Supabase credentials not configured in Vercel Environment Variables.' });
  }

  if (req.method === 'GET') {
    const { slug } = req.query;
    
    if (slug) {
      // Fetch single product by slug
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();
        
      if (error) return res.status(404).json({ error: 'Product not found' });
      return res.status(200).json(data);
    } else {
      // Fetch all products
      const { data, error } = await supabase
        .from('products')
        .select('*');
        
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }
  }

  if (req.method === 'POST') {
    // Add new product (In production, you'd verify admin auth here)
    const { slug, name, price, discount_price, stock, categories, features } = req.body;
    
    const { data, error } = await supabase
      .from('products')
      .insert([
        { slug, name, price, discount_price, stock, categories, features }
      ])
      .select();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json(data[0]);
  }

  if (req.method === 'PUT') {
    // Update product
    const { id, slug, name, price, discount_price, stock, categories, features } = req.body;
    
    if (!id) return res.status(400).json({ error: 'ID is required to update' });

    const { data, error } = await supabase
      .from('products')
      .update({ slug, name, price, discount_price, stock, categories, features })
      .eq('id', id)
      .select();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(data[0]);
  }

  if (req.method === 'DELETE') {
    // Delete product
    const { id } = req.body;
    
    if (!id) return res.status(400).json({ error: 'ID is required to delete' });

    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
