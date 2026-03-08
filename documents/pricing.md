Context:
The shop sells many liquor brands and receives products through VAT purchase invoices. Each purchase may have different prices, quantities, and expiry dates.

Key requirements:

1. Inventory Management
- Track products and brands
- Track total stock per product
- Track stock batches with expiry dates
- Track purchase history with VAT bills
- Support multiple purchase prices for the same product

2. Costing Model
   Use a WEIGHTED AVERAGE COST model for inventory valuation.

When new stock is purchased, the weighted average cost should update using:

New Average Cost =
((Old Quantity × Old Average Cost) + (New Quantity × Purchase Price))
/ (Old Quantity + New Quantity)

However, the system must ensure that profit calculations remain historically accurate even if the average cost later changes.

3. Sales and Profit Calculation
   Profit must be calculated as:

Profit = (Selling Price − Cost Price At Time Of Sale) × Quantity Sold

Important rule:
The system MUST store the cost price at the time of the sale so that later purchase price changes do not affect historical profit.

4. Batch Tracking
   Each purchase should create batches that contain:
- quantity
- cost price
- expiry date
- remaining quantity

Batches are primarily used for:
- expiry tracking
- stock tracking

Profit calculation should use the product-level weighted average cost unless FIFO batch costing is recommended.

5. System Goal
   Design a system that ensures:

- accurate historical profit
- accurate inventory valuation
- ability to track VAT purchase invoices
- expiry management
- support for multiple purchase prices
- scalable design for thousands of transactions

6. Deliver the following:

A. Explain the correct accounting logic for:
- weighted average costing
- profit calculation
- why storing cost at sale time is required

B. Design the full database schema including tables such as:
- Product
- Purchase
- PurchaseItem
- Batch
- Sale
- SaleItem
- Supplier

C. Show the fields for each table.

D. Explain when and how average cost should be updated.

E. Show the full algorithm for:
- processing a purchase
- updating weighted average cost
- processing a sale
- calculating profit

F. Explain edge cases:
- selling when multiple purchase prices exist
- partial batch usage
- expired stock
- price fluctuations

G. Provide best practices used in real ERP systems (SAP, Odoo, Oracle).

H. Recommend whether FIFO, Weighted Average, or Batch Costing is best for a liquor shop and explain why.

Important:
Think step-by-step like an ERP architect designing a production-level system. Focus on correctness, accounting accuracy, and scalability rather than simple examples.