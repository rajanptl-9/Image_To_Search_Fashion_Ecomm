import ProductDetailsDialog from "@/components/shopping-view/product-details";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { fetchProductDetails } from "@/store/shop/products-slice";
import {
  getSearchResults,
  resetSearchResults,
  getSimilarProducts,
} from "@/store/shop/search-slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import Dropzone from 'react-dropzone'

function SearchProducts() {
  const [keyword, setKeyword] = useState("");
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [currImage,setCurrImage] = useState();
  const dispatch = useDispatch();
  const { searchResults } = useSelector((state) => state.shopSearch);
  const { productDetails } = useSelector((state) => state.shopProducts);

  const { user } = useSelector((state) => state.auth);

  const { cartItems } = useSelector((state) => state.shopCart);
  const { toast } = useToast();
  useEffect(() => {
    if (keyword && keyword.trim() !== "" && keyword.trim().length > 3) {
      setCurrImage(null);
      setTimeout(() => {
        setSearchParams(new URLSearchParams(`?keyword=${keyword}`));
        dispatch(getSearchResults(keyword));
      }, 1000);
    } else {
      setSearchParams(new URLSearchParams(`?keyword=${keyword}`));
      dispatch(resetSearchResults());
    }
  }, [keyword]);

  function handleAddtoCart(getCurrentProductId, getTotalStock) {
    console.log(cartItems);
    let getCartItems = cartItems.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > getTotalStock) {
          toast({
            title: `Only ${getQuantity} quantity can be added for this item`,
            variant: "destructive",
          });

          return;
        }
      }
    }

    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Product is added to cart",
        });
      }
    });
  }

  function handleGetProductDetails(getCurrentProductId) {
    console.log(getCurrentProductId);
    dispatch(fetchProductDetails(getCurrentProductId));
  }

  function searchSimilar(e) {
    e.preventDefault();
    if (currImage && currImage !== null) {
      const formData = new FormData();
      formData.append("image", currImage);
      dispatch(getSimilarProducts(formData));
      console.log(formData.get("image"));
    } else {
      toast({
        title: "Please upload an image",
        variant: "destructive",
      });
    }
  }

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  function showSelectedImage(acceptedFiles) {
    setCurrImage(acceptedFiles[0]);  
    console.log(acceptedFiles[0]);
    setKeyword("");
  }

  return (
    <div className="container mx-auto md:px-6 px-4 py-8">
      <div className="flex  justify-between mb-8">
        <div className={`w-full flex flex-wrap gap-[1rem] items-center`}>
          <Input
            value={keyword}
            name="keyword"
            onChange={(event) => setKeyword(event.target.value)}
            className="py-6"
            placeholder="Search Products..."
          />
          <Dropzone onDrop={acceptedFiles => showSelectedImage(acceptedFiles)}>
            {({getRootProps, getInputProps}) => (
              <section className={`w-full border-4 border-dashed rounded-xl p-4 text-center cursor-pointer bg-gray-100 border-gray-300 hover:border-gray-400`}>
                <div {...getRootProps()}>
                  <input {...getInputProps()} />
                  <p>Drag 'n' drop your image file here, or click to select image</p>
                </div>
              </section>
            )}
          </Dropzone>
          <button
            className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
            onClick={e => searchSimilar(e)}          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
            Search Products
          </button>
        </div>        
      </div>
      {currImage &&<div className="w-full flex flex-wrap gap-[1rem] justify-between mb-8 p-2 border border-solid rounded-xl">
        <div>
        <h1 className="text-2xl font-bold mb-4">Uploaded Image</h1>
        <p className="text-gray-500 mb-2"><b>Path: </b>{currImage?.path}.</p>
        <p className="text-gray-500 mb-2 italic text-sm"> *Click on Drag 'n' drop to select a different one.</p>
        </div>
       <div className="w-[300px] height-full flex items-center justify-center border-4 border-solid rounded-xl p-2 text-center cursor-pointer bg-gray-100 border-gray-300 hover:border-gray-400">          
           <img src={URL.createObjectURL(currImage)} alt="selected" className="w-[50%] object-contain mx-auto my-auto" />
        </div>
      </div>}
      {!searchResults.length ? (
        <h1 className="text-5xl font-extrabold">No result found!</h1>
      ) : null}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {searchResults.map((item,idx) => (
          <ShoppingProductTile
            handleAddtoCart={handleAddtoCart}
            key={idx}
            product={item}
            handleGetProductDetails={handleGetProductDetails}
          />
        ))}
      </div>
      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
    </div>
  );
}

export default SearchProducts;
