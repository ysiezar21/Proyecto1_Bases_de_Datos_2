# Proyecto 1 - Bases de Datos 2

Sistema de gestión desarrollado con Node.js, Express y SQL Server, basado en la base de datos WideWorldImporters.

## Estudiantes

**Yader Siezar Chaves** - 2024134032
**Deiner Cespedes Molina** - 2024242294

## Requisitos previos

Antes de comenzar, debe tener instalado:

- SQL Server, version 2019 o superior
- Node.js, version 18 o superior
- npm, version 9 o superior
- Git
- sqlcmd (incluido en mssql-tools)

## Instalación

### 1. Clonar el repositorio y abrirlo

```bash
git clone https://github.com/ysiezar21/Proyecto1_Bases_de_Datos_2.git

cd Proyecto1_Bases_de_Datos_2
```

### 2. Restaurar la base de datos

Descarga el archivo "WideWorldImporters-Full.bak" de Microsoft:

Enlace: 
``bash
https://github.com/Microsoft/sql-server-samples/releases/tag/wide-world-importers-v1.0
``

**En SQL Server Linux (nativo):**

```bash
# Copiar el .bak a la carpeta de backups
sudo mkdir -p /var/opt/mssql/backup

sudo cp WideWorldImporters-Full.bak /var/opt/mssql/backup/

sudo chown mssql:mssql /var/opt/mssql/backup/WideWorldImporters-Full.bak
```

Verificar los nombres lógicos:

```bash
sqlcmd -S localhost -U sa -P 'CONTRASEÑA_DE_SU_LINUX' -C \-Q "RESTORE FILELISTONLY FROM DISK = '/var/opt/mssql/backup/WideWorldImporters-Full.bak'"
```

Restaurar la base:

```bash
sqlcmd -S localhost -U sa -P 'CONTRASEÑA_DE_SU_LINUX' -C -Q "
RESTORE DATABASE WideWorldImporters
FROM DISK = '/var/opt/mssql/backup/WideWorldImporters-Full.bak'
WITH MOVE 'WWI_Primary' TO '/var/opt/mssql/data/WideWorldImporters.mdf',
     MOVE 'WWI_UserData' TO '/var/opt/mssql/data/WideWorldImporters_UserData.ndf',
     MOVE 'WWI_Log' TO '/var/opt/mssql/data/WideWorldImporters.ldf',
     MOVE 'WWI_InMemory_Data_1' TO '/var/opt/mssql/data/WideWorldImporters_InMemory_Data_1'
"
```

Verificar:

```bash
sqlcmd -S localhost -U sa -P 'CONTRASEÑA_DE_SU_LINUX' -C -Q "SELECT name FROM sys.databases"
```

Debe aparecer "WideWorldImporters" en la lista de bases de datos.

### 3. Ejecutar los scripts SQL

```bash
cd ~/Proyecto1_Bases_de_Datos_2/Script

# Ejecutar uno por uno
sqlcmd -S localhost -U sa -P 'CONTRASEÑA_DE_SU_LINUX' -C -d WideWorldImporters -i "01_Setup_y_Modulo_Clientes.sql"

sqlcmd -S localhost -U sa -P 'CONTRASEÑA_DE_SU_LINUX' -C -d WideWorldImporters -i "02_Modulo_Proveedores.sql"

sqlcmd -S localhost -U sa -P 'CONTRASEÑA_DE_SU_LINUX' -C -d WideWorldImporters -i "03_Modulo_Inventario.sql"

sqlcmd -S localhost -U sa -P 'CONTRASEÑA_DE_SU_LINUX' -C -d WideWorldImporters -i "04_Modulo_Ventas.sql"

sqlcmd -S localhost -U sa -P 'CONTRASEÑA_DE_SU_LINUX' -C -d WideWorldImporters -i "05_Modulo_Estadisticas.sql"

sqlcmd -S localhost -U sa -P 'CONTRASEÑA_DE_SU_LINUX' -C -d WideWorldImporters -i "Common.sql"
```

Verificar que los procedures se crearon:

```bash
sqlcmd -S localhost -U sa -P 'CONTRASEÑA_DE_SU_LINUX' -C -d WideWorldImporters \
  -Q "SELECT name FROM sys.procedures WHERE schema_id = SCHEMA_ID('Api') ORDER BY name"
```

### 4. Configurar el Api

```bash
cd ../Api
npm install
```

Crear el archivo .env a partir del ejemplo:

```bash
cp .env.example .env
```

Editar .env con sus credenciales:

### 5. Configurar el WebSide

El WebSide es estático. No requiere instalación.

---

## Ejecutar el proyecto

En la VM Ubuntu (preferiblemente que tenga la configuracion de red en NAT):

```bash
# Obtener IP de la VM
hostname -I

# Permitir puertos en el firewall
sudo ufw allow 3000/tcp

sudo ufw allow 4000/tcp

# Api
cd Api
npm run dev

# WebSide (en otra terminal)
cd WebSide
npx serve . -l tcp://0.0.0.0:3000
```

En Windows:

Abrir en un navegador:
```bash
    http://IP_DE_LA_VM:3000
```

## Objetivos alcanzados

### Módulo de clientes

- Página de gestión de clientes
- Filtros acumulativos
- Filtro de nombre por texto libre (coincidencia parcial)
- Filtro por categoría (selección)
- Filtro por método de entrega (selección)
- Función restaurar filtros
- Orden alfabético por nombre ascendente por defecto
- Tabla con nombre, categoría y método de entrega
- Detalle en ventana por aparte
- Nombre, categoría y grupo de compra (BuyingGroup)
- Contactos primario y alternativo
- Cliente por facturar (BillToCustomerID)
- Métodos de entrega
- Ciudad de entrega
- Código postal
- Teléfono y fax
- Días de gracia para pagar (PaymentDays)
- Sitio web como enlace
- Dirección de entrega y postal
- Mapa con la ubicación (DeliveryLocation)

### Módulo de proveedores

- Página de gestión de proveedores
- Filtros acumulativos
- Filtro de nombre por texto libre
- Filtro por categoría (selección)
- Función restaurar filtros
- Orden alfabético por nombre ascendente
- Tabla con nombre, categoría y método de entrega
- Detalle en ventana por aparte
- Código del proveedor (SupplierReference)
- Nombre del proveedor
- Categoría
- Contactos primario y alternativo
- Métodos de entrega
- Ciudad de entrega
- Código postal de entrega
- Teléfono y fax
- Sitio web
- Dirección de entrega y postal
- Mapa con la ubicación (DeliveryLocation)
- Nombre del banco
- Número de cuenta corriente
- Días de gracia para pagar (PaymentDays)

### Módulo de inventarios

- Página de gestión de productos
- Filtros acumulativos
- Filtro de nombre por texto libre
- Filtro por grupo (selección)
- Función restaurar filtros
- Orden alfabético por nombre por defecto
- Tabla con nombre, grupo y cantidad en inventario (Holdings)
- Detalle en ventana por aparte
- Nombre del producto
- Nombre del proveedor como enlace
- Color
- Unidad de empaquetamiento (UnitPackage)
- Empaquetamiento exterior (OuterPackage)
- Cantidad de empaquetamiento (Quantity)
- Marca
- Tallas / tamaño
- Impuesto
- Precio unitario
- Precio de venta (RecommendedRetailPrice)
- Peso
- Palabras clave (SearchDetails)
- Cantidad disponible (QuantityOnHand)
- Ubicación

### Módulo de ventas

- Página de gestión de ventas
- Filtros acumulativos
- Filtro de nombre de cliente por texto libre
- Filtro de fecha por rango (selección múltiple)
- Filtro de monto por rango
- Función restaurar filtros
- Orden alfabético por nombre del cliente por defecto
- Tabla con número de factura, fecha, cliente, método de entrega y monto
- Detalle en ventana por aparte
- Encabezado: número de factura
- Nombre del cliente como enlace
- Método de entrega
- Número de orden (CustomerPurchaseOrderNumber)
- Persona de contacto
- Nombre del vendedor
- Fecha de la factura
- Instrucciones de entrega
- Detalle: nombre del producto como enlace
- Cantidad
- Precio unitario
- Impuesto aplicado
- Monto del impuesto
- Total por línea

### Reportes y datos estadísticos

- Reporte 1: montos más altos, bajos y promedio de compras a proveedores agrupados por proveedor y categoría (ROLLUP)
- Reporte 2: montos más altos, bajos y promedio de ventas a clientes agrupados por cliente y categoría (ROLLUP)
- Reporte 3: Top 5 de productos que generan más ganancia por año (DENSE_RANK + PARTITION)
- Reporte 4: Top 5 de clientes con mayor cantidad de facturas por año (DENSE_RANK + PARTITION)
- Reporte 5: Top 5 de proveedores con mayor cantidad de órdenes de compra por año (DENSE_RANK + PARTITION)
- Reporte 6: matriz resumen de ventas por categoría de producto y año (PIVOT)
- Reporte 7: seguimiento mensual de compras de clientes (filtros por año, mes, categoría y subcategoría)
- Reporte 8: seguimiento mensual de compras a proveedores (filtros por año, mes, categoría y subcategoría)
- Reporte 9: rotación promedio de inventario por producto (filtros por categoría, año y proveedor)
- Reporte 10: método de envío favorito según ubicación (filtros por año, mes, categoría de cliente, categoría de producto y producto)


## Objetivos no alcanzados
- Se completaron al 100% todos los objetivos

## Enlace del video de pruebas

```bash
    
``` 