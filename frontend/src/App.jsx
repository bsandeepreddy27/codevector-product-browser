
import React,{useEffect,useMemo,useState} from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const CATEGORIES = ['All', 'Electronics', 'Books', 'Fashion', 'Sports'];

export default function App(){
 const [items,setItems]=useState([]);
 const [cursor,setCursor]=useState(null);
 const [category,setCategory]=useState('All');
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState('');
 const [hasMore,setHasMore]=useState(true);

 const selectedCategory = useMemo(() => category === 'All' ? null : category, [category]);

 const load=async(reset=false)=>{
  setLoading(true);
  setError('');
  try{
    const params={ limit: 30 };
    if (selectedCategory) params.category = selectedCategory;
    if (!reset && cursor) params.cursor = cursor;
    const {data}=await axios.get(`${API_BASE_URL}/products`,{params});
    setCursor(data.nextCursor);
    setHasMore(Boolean(data.hasMore));
    setItems(prev => reset ? data.items : [...prev,...data.items]);
  }catch(err){
    setError(err?.response?.data?.error || 'Failed to load products.');
  }finally{
    setLoading(false);
  }
 };

 useEffect(()=>{
  setItems([]);
  setCursor(null);
  setHasMore(true);
  load(true);
 },[category]);

 return (
  <div style={{fontFamily:'Inter, system-ui, sans-serif', minHeight:'100vh', background:'linear-gradient(180deg, #f5f7fb 0%, #eef2f8 100%)', color:'#102033'}}>
    <div style={{maxWidth:1100, margin:'0 auto', padding:'40px 20px 60px'}}>
     <div style={{display:'flex', justifyContent:'space-between', gap:16, alignItems:'end', flexWrap:'wrap', marginBottom:24}}>
      <div>
        <div style={{textTransform:'uppercase', letterSpacing:'.14em', fontSize:12, color:'#5b6b7f'}}>CodeVector task by sandeep</div>
        <h1 style={{margin:'10px 0 8px', fontSize:'clamp(2.2rem, 5vw, 4rem)', lineHeight:1}}>Browse products fast.</h1>
        <p style={{margin:0, maxWidth:680, fontSize:16, color:'#44566b'}}>Keyset pagination with a snapshot cursor keeps the list stable even while the underlying data changes.</p>
      </div>
      <div style={{padding:'14px 16px', border:'1px solid #d5deea', borderRadius:16, background:'rgba(255,255,255,0.8)', backdropFilter:'blur(10px)'}}>
        <div style={{fontSize:12, color:'#5b6b7f'}}>Loaded</div>
        <div style={{fontSize:28, fontWeight:700}}>{items.length.toLocaleString()}</div>
      </div>
     </div>

     <div style={{display:'flex', gap:12, flexWrap:'wrap', marginBottom:20}}>
      {CATEGORIES.map(option => (
        <button
         key={option}
         onClick={() => setCategory(option)}
         style={{
          border:'1px solid ' + (category === option ? '#17324d' : '#c8d3e1'),
          background: category === option ? '#17324d' : '#ffffff',
          color: category === option ? '#ffffff' : '#17324d',
          borderRadius:999,
          padding:'10px 16px',
          cursor:'pointer',
          fontWeight:600
         }}
        >
         {option}
        </button>
      ))}
     </div>

     {error ? (
      <div style={{marginBottom:16, padding:14, borderRadius:14, background:'#fff0f0', border:'1px solid #ffc4c4', color:'#8d1f1f'}}>{error}</div>
     ) : null}

     <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:16}}>
      {items.map(product => (
        <article key={product.id} style={{padding:16, borderRadius:18, border:'1px solid #d8e0ea', background:'#ffffff', boxShadow:'0 10px 30px rgba(16,32,51,0.05)'}}>
         <div style={{fontSize:12, textTransform:'uppercase', letterSpacing:'.08em', color:'#5b6b7f', marginBottom:12}}>{product.category}</div>
         <h2 style={{fontSize:18, margin:'0 0 10px'}}>{product.name}</h2>
         <div style={{display:'flex', justifyContent:'space-between', gap:12, color:'#44566b'}}>
          <span>₹{Number(product.price).toFixed(2)}</span>
          <span>ID {product.id}</span>
         </div>
        </article>
      ))}
     </div>

     <div style={{display:'flex', justifyContent:'center', marginTop:28}}>
      <button
        onClick={() => load(false)}
        disabled={loading || !hasMore}
        style={{
         border:'none',
         background: loading || !hasMore ? '#9aa8b9' : '#17324d',
         color:'#fff',
         borderRadius:14,
         padding:'14px 22px',
         minWidth:180,
         cursor: loading || !hasMore ? 'not-allowed' : 'pointer',
         fontWeight:700
        }}
      >
        {loading ? 'Loading…' : hasMore ? 'Load more' : 'No more products'}
      </button>
     </div>
    </div>
  </div>
 )
}
