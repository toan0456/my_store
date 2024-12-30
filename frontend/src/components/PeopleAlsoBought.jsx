import React, { useEffect, useState } from 'react'
import toast from "react-hot-toast";
import ProductCard from './ProductCard';
import axiosInstance from '../lib/axios';
import LoadingSpinner from './LoadingSpinner';


const PeopleAlsoBought = () => {

  const [recommendations, setRecommendations] = useState([])
  const [loading , setLoading] = useState(false)

  useEffect(()=> {
    (
    async ()=> {
     try {
      const res = await axiosInstance(`/product/recomendation`)
      // console.log("recommendations", res.data)
      setRecommendations(res.data.data)
     } catch (error) {
      toast.error(error.response.data.message || "Lỗi server")
     } finally{
      setLoading(false)
     }
    }  
    )()
  },[])

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className='mt-8'>
			<h3 className='text-2xl font-semibold text-emerald-400'>People also bought</h3>
			<div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg: grid-col-3'>
				{recommendations.map((product) => (
					<ProductCard key={product._id} product={product} />
				))}
			</div>
		</div>
  )
}

export default PeopleAlsoBought