import { useParams } from "react-router-dom";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import ProductImageGallery from "../components/product/ProductImageGallery";
import ProductInfo from "../components/product/ProductInfo";
import ProductDescription from "../components/product/ProductDescription";

const ProductDetail = () => {
  const { productId } = useParams();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-6">
        <section className="w-full px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <ProductImageGallery />
            
            <div className="lg:pl-12 mt-8 lg:mt-0">
              <ProductInfo />
              <ProductDescription />
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;