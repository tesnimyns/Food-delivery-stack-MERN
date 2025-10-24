import React, { useState } from 'react';
import './AddProducts.css';
// import { IoIosAddCircleOutline } from "react-icons/io";
// import { FaListUl } from "react-icons/fa6";
import upload_area from '../../assets/upload-area.png';
import axios from 'axios';
import { toast } from 'react-toastify';

interface AddProductsProps {
  url: string;
}

const AddProducts: React.FC<AddProductsProps> = ({url}) => {

 
  const [image, setImage] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0]);
    }
  };


  const [data,setData]=useState({
    name:"",
    description:"",
    price:"",
    category:"salad"
  })

  const onChangeHandler =(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>)=>{
    const name = event.target.name;
    const value = event.target.value;
    setData(data=>({...data,[name]:value}))
  }

  const onSubmitHandler = async (event: { preventDefault: () => void; } )=>{
      event.preventDefault();
      const formData = new FormData();
      formData.append("name",data.name)
      formData.append("description",data.description)
      formData.append("price",data.price)
      formData.append("category",data.category)
      if (image) {
        formData.append("image", image);
      }
      const response = await axios.post(`${url}/api/food/add`,formData)
      if(response.data.success){
        setData({
          name:"",
          description:"",
          price:"",
          category:"salad"
        })
        setImage(null)
        toast.success(response.data.message)

      }else{
        toast.error(response.data.message)
      }
  }





  return (
    <div className='add'>
      <form className='flex-col' onSubmit={onSubmitHandler}>
        <div className="add-img-upload flex-col">
          <p>Upload Image</p>
          <label htmlFor="image">
            <img src={image ? URL.createObjectURL(image) : upload_area} alt="Upload area" />
          </label>
          <input onChange={handleImageChange} type="file" id='image' hidden required />
        </div>
        <div className="add-product-name flex-col">
          <p>Product Name</p>
          <input onChange={onChangeHandler} value={data.name} type="text" name='name' placeholder='Type here' />
        </div>
        <div className="add-product-description flex-col">
          <p>Products description</p>
          <textarea onChange={onChangeHandler} value={data.description} name="description" rows={6} placeholder='Write content here ' required></textarea>
        </div>
        <div className="add-category-price">
          <div className="add-category flex-col">
            <p>Product Category</p>
            <select onChange={onChangeHandler} name="category">
              <option value="salad">Salad</option>
              <option value="Pasta">Pasta</option>
              <option value="Pizza">Pizza</option>
              <option value="Sandwich">Sandwich</option>
              <option value="Rolls">Rolls</option>
              <option value="Deserts">Deserts</option>
              <option value="Cake">Cake</option>
            </select>
          </div>
          <div className="add-price flex-col">
            <p>Product Price</p>
            <input onChange={onChangeHandler} value={data.price} type="number" name='price' placeholder='20 Dt' />
          </div>
        </div>
        <button type='submit' className='add-btn'>ADD</button>
      </form>
    </div>
  );
};

export default AddProducts;
