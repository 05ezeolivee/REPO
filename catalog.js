/* ==========================================================================
   CATÁLOGO DE PRODUCTOS  —  Lista de Reposición
   --------------------------------------------------------------------------
   Para agregar / editar / quitar productos, tocá SOLO este archivo.
   Estructura:
     categoría  →  grupos (marca o línea)  →  productos

   Cada producto es un texto con su nombre completo, por ejemplo:
       "Danette Postre Chocolate x2"

   Si querés poder RENOMBRAR un producto sin perder las cantidades que ya
   tiene cargadas, usá la forma con id fijo:
       { n: "Nombre nuevo", id: "id-que-ya-tenia" }

   El "xN" del nombre es el contenido del pack comercial (NO las cajas).
   ========================================================================== */

const CATALOGO = [
  {
    id: "postres", nombre: "Postres", emoji: "🍮", hue: 335,
    grupos: [
      {
        nombre: "SER",
        productos: [
          "Ser Flan Vainilla x2",
          "Ser Postre Dulce de Leche x2",
          "Ser Postre Chocolate x2",
          "Ser Gelatina Cereza 120g",
          "Ser Gelatina Frutilla 120g",
          "Ser Flan Vainilla x4",
          "Ser Flan Vainilla x6"
        ]
      },
      {
        nombre: "SERENITO",
        productos: [
          "Serenito Gelatina Frutilla 120g",
          "Serenito Gelatina Manzana Verde 120g",
          "Serenito WAU Postre Vainilla x2",
          "Serenito Capuchón Rockets Vainilla 120g",
          "Serenito Capuchón Bombas Crocantes Vainilla 118g",
          "Serenito Rockets Vainilla x3",
          "Serenito Bombas Crocantes Vainilla x3"
        ]
      },
      {
        nombre: "DANETTE",
        productos: [
          "Danette Postre Dulce de Leche x2",
          "Danette Postre Chocolate x2",
          "Danette Postre Crema Americana x2",
          "Danette Postre Pistacho x2",
          "Danette Flan Vainilla x2",
          "Danette Flan Dulce de Leche x2",
          "Danette La Copa Chocolate a la Crema 100g",
          "Danette La Copa Dulce de Leche con Crema 100g",
          "Danette Flan Vainilla + Los Nietitos 250g",
          "Danette Chocolate + M&M 220g",
          "Danette Postre Dulce de Leche x4",
          "Danette Postre Chocolate x4",
          "Danette Postre Crema Americana x4",
          "Danette Flan Vainilla x4",
          "Danette Flan Vainilla x6"
        ]
      }
    ]
  },

  {
    id: "quesos", nombre: "Quesos y untables", emoji: "🧀", hue: 42,
    grupos: [
      {
        nombre: "CASANCREM",
        productos: [
          "CasanCrem Light 290g",
          "CasanCrem Clásico 290g",
          "CasanCrem Sin Sal Agregada 290g",
          "CasanCrem Light 500g",
          "CasanCrem Clásico 500g"
        ]
      },
      {
        nombre: "FINLANDIA",
        productos: [
          "Finlandia Clásico 180g",
          "Finlandia Light 180g",
          "Finlandia Sin Sal Agregada 180g",
          "Finlandia Clásico Manga 2kg"
        ]
      },
      {
        nombre: "QUESOS LA SERENÍSIMA",
        productos: [
          "Finlandia Chef Danbo Fetas Clásico 150g",
          "Finlandia Chef Danbo Fetas Light 150g",
          "Cremón Entero Horma",
          "Cremón Entero Aprox. 500g",
          "Cremón Light Horma",
          "Cremón Light Aprox. 500g",
          "Port Salut Entero Horma",
          "Port Salut Entero Aprox. 450g",
          "Port Salut Light Horma",
          "Port Salut Light Aprox. 450g",
          "Gouda Cuña Aprox. 340g",
          "Sardo Cuña Aprox. 280g",
          "Provoleta Sobre 180g",
          "Queso Rallado Reggianito Sobre 120g"
        ]
      }
    ]
  },

  {
    id: "yogures", nombre: "Yogures", emoji: "🥣", hue: 280,
    grupos: [
      {
        nombre: "SER",
        productos: [
          "Ser Sachet Multifruta 1kg",
          "Ser Botella Multifruta 190g",
          "Ser Botella Frutilla 190g",
          "Ser Crunch Cereales con Miel 164g",
          "Ser Crunch Granola Berries 155g",
          "Ser Batido Natural 460g",
          "Ser Batido Durazno 460g",
          "Ser Batido Frutilla y Chía 460g",
          "Ser Batido Frutos Rojos 460g",
          "Ser Batido Deslactosado Natural 460g",
          "Ser Batido Deslactosado Arándanos 460g",
          "Ser Batido Deslactosado Frutilla 460g",
          "Ser CALCI+ Frutos Rojos 120g",
          "Ser PRO+ Botella Frutilla y Arándanos 190g",
          "Ser PRO+ Botella Vainilla 190g",
          "Ser PRO+ Pote Frutos Rojos 175g",
          "Ser PRO+ Pote Natural 175g"
        ]
      },
      {
        nombre: "DANONINO",
        productos: [
          "Danonino Pack Vainilla x2 161g",
          "Danonino Pack Frutilla x2 161g",
          "Danonino Bebible Frutilla 100g",
          "Danonino Bebible Frutilla 185g",
          "Danonino Bebible Vainilla 185g",
          "Danonino Promo Frutilla x3 555g"
        ]
      },
      {
        nombre: "ACTIVIA",
        productos: [
          "Activia Sachet Ciruela 1kg",
          "Activia Bebible Ciruela 170g",
          "Activia Bebible Zero Ciruela 170g",
          "Activia Pote Ciruela x4 340g"
        ]
      },
      {
        nombre: "ACTIMEL",
        productos: [
          "Actimel Frutilla x6 600g",
          "Actimel Multifruta x6 600g",
          "Actimel Naranja x6 600g"
        ]
      }
    ]
  },

  {
    id: "jugos", nombre: "Jugos y bebidas", emoji: "🧃", hue: 24,
    grupos: [
      {
        nombre: "CINDOR",
        productos: [
          "Cindor Chocolatada 200ml",
          "Cindor Chocolatada 1000ml",
          "Cindor Chocolatada Pack x4 800ml"
        ]
      },
      {
        nombre: "CITRIC",
        productos: [
          "Citric Naranja 250ml",
          "Citric Naranja 500ml",
          "Citric Naranja y Frutilla 500ml",
          "Citric Naranja y Durazno 500ml",
          "Citric Naranja 1000ml",
          "Citric Naranja Sin Pulpa 1000ml",
          "Citric Pomelo 1000ml",
          "Citric Naranja y Frutilla 1000ml",
          "Citric Naranja y Durazno 1000ml",
          "Citric Naranja y Mango 1000ml",
          "Citric Blends Naranja y Zanahoria 1000ml",
          "Citric Naranja 1500ml",
          "Citric Naranja y Durazno 1500ml",
          "Citric Naranja Bidón 3000ml",
          "Citric Naranja Bidón 5000ml"
        ]
      }
    ]
  },

  {
    id: "silk", nombre: "Silk", emoji: "🌱", hue: 145,
    grupos: [
      {
        nombre: "ALMENDRAS",
        productos: [
          "Silk Almendras Azucarada Chocolate 190ml",
          "Silk Almendras Azucarada Chocolate 1000ml",
          "Silk Almendras Azucarada Natural 1000ml",
          "Silk Almendras Azucarada Vainilla 946ml",
          "Silk Almendras Sin Azúcar Natural 1000ml",
          "Silk Almendras Sin Azúcar Vainilla 1000ml"
        ]
      },
      {
        nombre: "OTRAS VARIEDADES",
        productos: [
          "Silk Coco Sin Azúcar Natural 1000ml",
          "Silk Avena Sin Azúcar Natural 946ml",
          "Silk Soja Sin Azúcar Natural 946ml"
        ]
      }
    ]
  },

  {
    id: "leches", nombre: "Leches y derivados", emoji: "🥛", hue: 205,
    grupos: [
      {
        nombre: "LA SERENÍSIMA",
        productos: [
          "Leche Entera Botella 1000g",
          "Leche Descremada Botella 1000g",
          "Leche 0% Lactosa Botella 1000g",
          "Leche con Hierro Botella 1000g",
          "Leche Barista Botella 1000g",
          "Leche en Polvo 0% Lactosa Caja 400g",
          "Crema de Leche Tetra 200g",
          "Manteca Extra Pack 200g"
        ]
      }
    ]
  },

  {
    id: "dulce-de-leche", nombre: "Dulce de leche", emoji: "🍯", hue: 30,
    grupos: [
      {
        nombre: "LA SERENÍSIMA",
        productos: [
          "Dulce de Leche Estilo Colonial 250g",
          "Dulce de Leche Estilo Colonial 400g"
        ]
      }
    ]
  },

  {
    id: "levaduras", nombre: "Levaduras", emoji: "🍞", hue: 85,
    grupos: [
      {
        nombre: "LEVEX",
        productos: [
          "Levex Levadura Fresca Natural Display x10 500g"
        ]
      }
    ]
  }
];
