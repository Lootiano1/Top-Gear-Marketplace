const express = require('express');
const axios = require('axios');
const QRCode = require('qrcode');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const products = [
  { id: 1, image: "/images/filtro-ar.jpg", name: 'Filtro de Ar', price: 50 },
  { id: 2, name: 'Óleo de Motor', price: 80 },
  { id: 3, name: 'Pastilha de Freio', price: 120 },
];

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.post('/api/generate-qrcode', async (req, res) => {
  const { paymentInfo } = req.body;
  if (!paymentInfo) {
    return res.status(400).json({ error: 'Payment info is required' });
  }
  try {
    const qrCodeUrl = await QRCode.toDataURL(paymentInfo);
    res.json({ qrCodeUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

app.get('/api/cep/:cep', async (req, res) => {
  const { cep } = req.params;
  const cepRegex = /^[0-9]{5}-?[0-9]{3}$/;
  if (!cepRegex.test(cep)) {
    return res.status(400).json({ error: 'Invalid CEP format' });
  }
  try {
    const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
    if (response.data.erro) {
      return res.status(404).json({ error: 'CEP not found' });
    }
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching CEP information' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});