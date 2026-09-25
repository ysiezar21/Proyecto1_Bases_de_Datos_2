USE WideWorldImporters;
GO

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'Syn')
    EXEC('CREATE SCHEMA Syn');
GO
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'Api')
    EXEC('CREATE SCHEMA Api');
GO

IF OBJECT_ID('Syn.Customers', 'SN') IS NOT NULL DROP SYNONYM Syn.Customers;
CREATE SYNONYM Syn.Customers FOR Sales.Customers;
GO
 
IF OBJECT_ID ('Syn.CustomerCategories', 'SN') IS NOT NULL DROP SYNONYM Syn.CustomerCategories;
CREATE SYNONYM Syn.CustomerCategories FOR Sales.CustomerCategories;
GO

IF OBJECT_ID ('Syn.BuyingGroups', 'SN') IS NOT NULL DROP SYNONYM Syn.BuyingGroups;
CREATE SYNONYM Syn.BuyingGroups FOR Sales.BuyingGroups;
GO

IF OBJECT_ID ('Syn.People', 'SN') IS NOT NULL DROP SYNONYM Syn.People;
CREATE SYNONYM Syn.People FOR Application.People;
GO

IF OBJECT_ID ('Syn.DeliveryMethods', 'SN') IS NOT NULL DROP SYNONYM Syn.DeliveryMethods;
CREATE SYNONYM Syn.DeliveryMethods FOR Application.DeliveryMethods;
GO

IF OBJECT_ID ('Syn.Cities', 'SN') IS NOT NULL DROP SYNONYM Syn.Cities;
CREATE SYNONYM Syn.Cities FOR Application.Cities;
GO