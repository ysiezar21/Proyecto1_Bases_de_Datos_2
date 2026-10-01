USE WideWorldImporters;
GO

/* ============================================================
   SINÓNIMOS PARA VENTAS
   ============================================================ */

IF OBJECT_ID('Syn.InvoiceLines', 'SN') IS NOT NULL DROP SYNONYM Syn.InvoiceLines;
CREATE SYNONYM Syn.InvoiceLines FOR Sales.InvoiceLines;
GO

/* ============================================================
   PROCEDURES DE VENTAS
   ============================================================ */

-- Listar facturas con filtros acumulativos y paginación
CREATE OR ALTER PROCEDURE Api.usp_Ventas_Listar
    @Nombre NVARCHAR(100) = NULL,
    @DeliveryMethodID INT = NULL,
    @FechaDesde DATE = NULL,
    @FechaHasta DATE = NULL,
    @MontoMin DECIMAL(18,2) = NULL,
    @MontoMax DECIMAL(18,2) = NULL,
    @Pagina INT = 1,
    @TamanoPagina INT = 50
AS
BEGIN
    SET NOCOUNT ON;

    IF @Pagina < 1 SET @Pagina = 1;
    IF @TamanoPagina < 1 SET @TamanoPagina = 50;

    SELECT
        i.InvoiceID AS NumeroFactura,
        i.CustomerID,
        c.CustomerName AS Cliente,
        CONVERT(VARCHAR(10), i.InvoiceDate, 23) AS Fecha,
        dm.DeliveryMethodName AS MetodoEntrega,
        m.Monto,
        COUNT(*) OVER() AS TotalRegistros
    FROM Syn.Invoices i
    INNER JOIN (
        SELECT InvoiceID, SUM(ExtendedPrice) AS Monto
        FROM Syn.InvoiceLines
        GROUP BY InvoiceID
    ) m ON m.InvoiceID = i.InvoiceID
    INNER JOIN Syn.Customers c ON c.CustomerID = i.CustomerID
    INNER JOIN Syn.DeliveryMethods dm ON dm.DeliveryMethodID = i.DeliveryMethodID
    WHERE (@Nombre IS NULL OR c.CustomerName LIKE '%' + @Nombre + '%')
      AND (@DeliveryMethodID IS NULL OR i.DeliveryMethodID = @DeliveryMethodID)
      AND (@FechaDesde IS NULL OR i.InvoiceDate >= @FechaDesde)
      AND (@FechaHasta IS NULL OR i.InvoiceDate <= @FechaHasta)
      AND (@MontoMin IS NULL OR m.Monto >= @MontoMin)
      AND (@MontoMax IS NULL OR m.Monto <= @MontoMax)
    ORDER BY c.CustomerName ASC, i.InvoiceID ASC
    OFFSET (@Pagina - 1) * @TamanoPagina ROWS
    FETCH NEXT @TamanoPagina ROWS ONLY;
END
GO

-- Encabezado de la factura
CREATE OR ALTER PROCEDURE Api.usp_Ventas_Detalle
    @InvoiceID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        i.InvoiceID AS NumeroFactura,
        i.CustomerID,
        c.CustomerName AS Cliente,
        dm.DeliveryMethodName AS MetodoEntrega,
        i.CustomerPurchaseOrderNumber AS NumeroOrden,
        contacto.FullName AS PersonaContacto,
        vendedor.FullName AS Vendedor,
        CONVERT(VARCHAR(10), i.InvoiceDate, 23) AS Fecha,
        i.DeliveryInstructions AS InstruccionesEntrega
    FROM Syn.Invoices i
    INNER JOIN Syn.Customers c ON c.CustomerID = i.CustomerID
    INNER JOIN Syn.DeliveryMethods dm ON dm.DeliveryMethodID = i.DeliveryMethodID
    LEFT JOIN Syn.People contacto ON contacto.PersonID = i.ContactPersonID
    LEFT JOIN Syn.People vendedor ON vendedor.PersonID = i.SalespersonPersonID
    WHERE i.InvoiceID = @InvoiceID;
END
GO

-- Líneas de la factura
CREATE OR ALTER PROCEDURE Api.usp_Ventas_Lineas
    @InvoiceID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        il.InvoiceLineID,
        il.StockItemID,
        si.StockItemName AS Producto,
        il.Quantity AS Cantidad,
        il.UnitPrice AS PrecioUnitario,
        il.TaxRate AS ImpuestoAplicado,
        il.TaxAmount AS MontoImpuesto,
        il.ExtendedPrice AS TotalLinea
    FROM Syn.InvoiceLines il
    INNER JOIN Syn.StockItems si ON si.StockItemID = il.StockItemID
    WHERE il.InvoiceID = @InvoiceID
    ORDER BY il.InvoiceLineID ASC;
END
GO