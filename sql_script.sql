-- Creación de la base de datos EyTest2 así como su previa verificación en caso exista.
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'EyTest2')
BEGIN
    CREATE DATABASE EyTest2;
    PRINT 'Check';
END
ELSE
BEGIN
    PRINT 'Ya existe esa BD';
END
GO

USE EyTest2;
GO

-- Creación de las tablas solicitadas.

-- Tabla: PROVIDERS 
CREATE TABLE dbo.PROVIDERS(
    ID INT IDENTITY(1,1) PRIMARY KEY,
    LEGALNAME NVARCHAR(255) NOT NULL,      -- Razón Social
    TRADENAME NVARCHAR(255),               -- Nombre Comercial
    TAXID CHAR(11) NOT NULL,               -- Identificación tributaria (11 dígitos)
    PHONE NVARCHAR(20),                    -- Teléfono
    EMAIL NVARCHAR(255),                   -- Correo electrónico
    WEBSITE NVARCHAR(255),                 -- Sitio Web
    ADDRESSS NVARCHAR(500),                -- Dirección Física
    COUNTRY NVARCHAR(100),                 -- País
    ANNUALREVENUE DECIMAL(18,2),           -- Facturación Anual
    LASTUPDATED DATETIME2 NOT NULL DEFAULT SYSDATETIME() -- Última actualización
);

-- Inserciones de datos inciales para pruebas
-- Insertar datos en tabla PROVIDERS
INSERT INTO PROVIDERS 
(LEGALNAME, TRADENAME, TAXID, PHONE, EMAIL, WEBSITE, ADDRESSS, COUNTRY, ANNUALREVENUE)
VALUES
(
'OSCORP CORPORATION EIRL',
'OSCORP',
'20123456789',
'+51 900800700',
'oscorp@aitel.com',
'https://oscorp.com',
'Av.Perú 123',
'Perú',
2500000.00
);

-- Insert de más mock de datos
INSERT INTO Providers 
(LegalName, TradeName, TaxId, Phone, Email, Website, Addresss, Country, AnnualRevenue)
VALUES
(
    'GLOBAL TECH SOLUTIONS S.A.',
    'GlobalTech',
    '20456789012',
    '+51 987654321',
    'info@globaltech.com',
    'https://www.globaltech.com',
    'Av. Tecnológica 456',
    'Perú',
    5200000.00
),
(
    'ANDES LOGISTICS EIRL',
    'AndesLog',
    '20567890123',
    '+51 912345678',
    'contacto@andeslogistics.pe',
    'https://www.andeslogistics.pe',
    'Jr. Transporte 890',
    'Perú',
    890000.00
),
(
    'PACIFIC TRADING LLC',
    'Pacific Trading',
    '30678901234',
    '+1 3055551234',
    'sales@pacifictrading.com',
    'https://www.pacifictrading.com',
    '123 Ocean Drive, Miami, FL',
    'United States',
    12400000.00
),
(
    'EUROPEAN FINANCIAL GROUP LTD',
    'EFG',
    '50789012345',
    '+44 2079460000',
    'compliance@efg.co.uk',
    'https://www.efg.co.uk',
    '10 Downing Street',
    'United Kingdom',
    37800000.00
),
(
    'ASIA PACIFIC CONSULTING PTE LTD',
    'APAC Consulting',
    '70890123456',
    '+65 61234567',
    'admin@apacconsulting.sg',
    'https://www.apacconsulting.sg',
    '1 Marina Boulevard',
    'Singapore',
    9100000.00
);
