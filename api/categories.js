import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://alvwqkqsokaiarrmweht.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsdndxa3Fzb2thaWFycm13ZWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzOTcyNjQsImV4cCI6MjA5ODk3MzI2NH0.fR2O_DvLGcDxUC3Ld4DrRafKJH4kEJhCUScswKaUKfA';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) {
        // Fallback: If table doesn't exist yet, just extract unique categories from products
        const { data: prodData } = await supabase.from('products').select('categories');
        if (prodData) {
             const uniqueCats = [...new Set(prodData.map(p => p.categories).filter(Boolean).map(c => c.split(',')).flat().map(c => c.trim()))];
             return res.status(200).json(uniqueCats.map((c, i) => ({ id: i, name: c, slug: c.toLowerCase().replace(/\\s+/g, '-') })));
        }
        return res.status(500).json({ error: error.message });
    }
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { name, slug } = req.body;
    const { data, error } = await supabase.from('categories').insert([{ name, slug }]).select();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json(data[0]);
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
