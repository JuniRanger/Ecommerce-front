import Header from "@/components/Header";
import styled from "styled-components";
import Center from "@/components/Center";
import Button from "@/components/Button";
import {useContext, useEffect, useState} from "react";
import {CartContext} from "@/components/CartContext";
import axios from "axios";
import Table from "@/components/Table";
import Input from "@/components/Input";
import {RevealWrapper} from "next-reveal";
import {useSession} from "next-auth/react";

const ColumnsWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  @media screen and (min-width: 768px) {
    grid-template-columns: 1.2fr .8fr;
  }
  gap: 40px;
  margin-top: 40px;
  margin-bottom: 40px;
  table thead tr th:nth-child(3),
  table tbody tr td:nth-child(3),
  table tbody tr.subtotal td:nth-child(2){
    text-align: right;
  }
  table tr.subtotal td{
    padding: 15px 0;
  }
  table tbody tr.subtotal td:nth-child(2){
    font-size: 1.4rem;
  }
  tr.total td{
    font-weight: bold;
  }
`;

const Box = styled.div`
  background-color: #fff;
  border-radius: 10px;
  padding: 30px;
`;

const ProductInfoCell = styled.td`
  padding: 10px 0;
  button{padding:0 !important;}
`;

const ProductImageBox = styled.div`
  width: 70px;
  height: 100px;
  padding: 2px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  display:flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  img{
    max-width: 60px;
    max-height: 60px;
  }
  @media screen and (min-width: 768px) {
    padding: 10px;
    width: 100px;
    height: 100px;
    img{
      max-width: 80px;
      max-height: 80px;
    }
  }
`;

const QuantityLabel = styled.span`
  padding: 0 15px;
  display: block;
  @media screen and (min-width: 768px) {
    display: inline-block;
    padding: 0 6px;
  }
`;

const CityHolder = styled.div`
  display:flex;
  gap: 5px;
`;

export default function CartPage() {
  const {cartProducts, addProduct, removeProduct, clearCart} = useContext(CartContext);
  const {data: session} = useSession();
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [country, setCountry] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [shippingFee, setShippingFee] = useState(null);

  useEffect(() => {
    if (cartProducts.length > 0) {
      axios.post('/api/cart', {ids: cartProducts})
        .then(response => {
          setProducts(response.data);
        })
        .catch(error => {
          console.error("Error fetching cart products:", error);
        });
    } else {
      setProducts([]);
    }
  }, [cartProducts]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (window?.location.href.includes('success')) {
      setIsSuccess(true);
      clearCart();
    }
    axios.get('/api/settings?name=shippingFee')
      .then(res => {
        if (res.data) {
          setShippingFee(res.data.value);
        }
      })
      .catch(error => {
        console.error("Error fetching shipping fee:", error);
      });
  }, []);

  useEffect(() => {
    if (!session) {
      return;
    }
    axios.get('/api/address')
      .then(response => {
        if (response.data) {
          setName(response.data.name);
          setEmail(response.data.email);
          setCity(response.data.city);
          setPostalCode(response.data.postalCode);
          setStreetAddress(response.data.streetAddress);
          setCountry(response.data.country);
        }
      })
      .catch(error => {
        console.error("Error fetching user address:", error);
      });
  }, [session]);

  function moreOfThisProduct(id) {
    addProduct(id);
  }

  function lessOfThisProduct(id) {
    removeProduct(id);
  }

  async function goToPayment() {
    try {
      const response = await axios.post('/api/checkout', {
        name, email, city, postalCode, streetAddress, country, cartProducts,
      });
      if (response.data.url) {
        window.location = response.data.url;
      }
    } catch (error) {
      console.error("Error during checkout:", error);
    }
  }

  let productsTotal = 0;
  for (const productId of cartProducts) {
    const price = products.find(p => p._id === productId)?.price || 0;
    productsTotal += price;
  }

  if (isSuccess) {
    return (
      <>
        <Header />
        <Center>
          <ColumnsWrapper>
            <Box>
              <h1>Gracias por tu compra!</h1>
              <p>Te enviaremos un correo cuando tu compra se haya enviado.</p>
            </Box>
          </ColumnsWrapper>
        </Center>
      </>
    );
  }

  return (
    <>
      <Header />
      <Center>
        <ColumnsWrapper>
          <RevealWrapper delay={0}>
            <Box>
              <h2>Carrrito</h2>
              {!cartProducts?.length && (
                <div>Carrito vacio</div>
              )}
              {products?.length > 0 && (
                <Table>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product._id}>
                        <ProductInfoCell>
                          <ProductImageBox>
                            <img src={product.images[0]} alt="" />
                          </ProductImageBox>
                          {product.title}
                        </ProductInfoCell>
                        <td>
                          <Button onClick={() => lessOfThisProduct(product._id)}>-</Button>
                          <QuantityLabel>
                            {cartProducts.filter(id => id === product._id).length}
                          </QuantityLabel>
                          <Button onClick={() => moreOfThisProduct(product._id)}>+</Button>
                        </td>
                        <td>
                          ${cartProducts.filter(id => id === product._id).length * product.price}
                        </td>
                      </tr>
                    ))}
                    <tr className="subtotal">
                      <td colSpan={2}>Productos</td>
                      <td>${productsTotal}</td>
                    </tr>
                    <tr className="subtotal">
                      <td colSpan={2}>Envio</td>
                      <td>${shippingFee}</td>
                    </tr>
                    <tr className="subtotal total">
                      <td colSpan={2}>Total</td>
                      <td>${productsTotal + parseInt(shippingFee || 0)}</td>
                    </tr>
                  </tbody>
                </Table>
              )}
            </Box>
          </RevealWrapper>
          {!!cartProducts?.length && (
            <RevealWrapper delay={100}>
              <Box>
                <h2>Información del pedido</h2>
                <Input type="text"
                  placeholder="Nombre"
                  value={name}
                  name="name"
                  onChange={ev => setName(ev.target.value)} />
                <Input type="text"
                  placeholder="Correo"
                  value={email}
                  name="email"
                  onChange={ev => setEmail(ev.target.value)} />
                <CityHolder>
                  <Input type="text"
                    placeholder="Ciudad"
                    value={city}
                    name="city"
                    onChange={ev => setCity(ev.target.value)} />
                  <Input type="text"
                    placeholder="Codigo Postal"
                    value={postalCode}
                    name="postalCode"
                    onChange={ev => setPostalCode(ev.target.value)} />
                </CityHolder>
                <Input type="text"
                  placeholder="Dirección"
                  value={streetAddress}
                  name="streetAddress"
                  onChange={ev => setStreetAddress(ev.target.value)} />
                <Input type="text"
                  placeholder="País"
                  value={country}
                  name="country"
                  onChange={ev => setCountry(ev.target.value)} />
                <Button black block
                  onClick={goToPayment}>
                  Pagar
                </Button>
              </Box>
            </RevealWrapper>
          )}
        </ColumnsWrapper>
      </Center>
    </>
  );
}
