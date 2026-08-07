# BuyGadgets - Project Specification

Version: 1.0

Author: Pencil Digital Services

---

# Project Overview

BuyGadgets is a modern e-commerce platform for selling smartphones, tablets, gadgets and mobile accessories.

The application consists of:

- Customer Storefront
- Admin Dashboard
- Authentication
- Inventory Management
- Order Management
- Payment Integration
- Delivery Management

The application will be built using modern technologies with performance and scalability in mind.

---

# Tech Stack

## Frontend

- Next.js 16 (App Router)
- TypeScript
- TailwindCSS
- shadcn/ui
- React Hook Form
- Zod
- TanStack Query
- Zustand

## Backend

- Next.js Server Actions
- Route Handlers
- Supabase

## Database

Supabase PostgreSQL

## ORM

Prisma

## Authentication

Supabase Auth

Admin login only.

Customers may checkout as:

- Guest
- Registered User

## Storage

Supabase Storage

Used for:

- Product Images
- Banner Images
- Brand Logos

---

# Payment Providers

1. Paystack
2. Credit Direct (Manual via WhatsApp)
3. Klump (Manual via WhatsApp)

---

# Customer Features

## Home Page

Display:

- Hero Banner
- Featured Phones
- Flash Sales
- New Arrivals
- Best Sellers
- Popular Brands
- Latest Accessories
- Testimonials
- Newsletter

---

## Products

Users can:

- Search products
- Filter products
- Sort products
- Compare products
- View specifications
- Add to wishlist
- Add to cart

---

## Search

Search by:

- Product Name
- Brand
- Category
- Model

Results should update instantly.

---

## Product Comparison

Maximum comparison:

2 products

Comparison table should include:

- Image
- Name
- Brand
- Price
- RAM
- Storage
- Processor
- Screen Size
- Camera
- Battery
- Warranty
- Availability

---

## Product Details

Display:

Gallery

Description

Specifications

Related Products

Reviews

Stock Status

Add to Cart

Buy Now

Compare

Wishlist

---

## Cart

Users can:

Increase quantity

Decrease quantity

Remove product

Apply coupon

View subtotal

Proceed to checkout

---

# Delivery

Before checkout, customer selects delivery option.

Available options:

## BuyGadgets Delivery

Configured by admin.

Fields:

- Delivery Fee
- Estimated Days

---

## GIG Logistics

Configured by admin.

Fields:

- Delivery Fee
- Estimated Days

---

## Pickup in Store

Fee:

₦0

Customer will receive pickup instructions.

---

Delivery fee is added to:

Subtotal

before checkout.

Formula

Grand Total

=

Products Total

+

Delivery Fee

-

Discount

---

# Checkout

Collect:

First Name

Last Name

Phone Number

Email

State

City

Address

Order Notes

Delivery Method

Payment Method

---

# Payment Methods

## 1. Paystack

Redirect customer to Paystack payment page.

On successful payment:

Create order.

Update payment status.

Redirect to success page.

---

## 2. Credit Direct

When selected:

Show popup.

Popup:

Pay a 25% deposit and spread the balance over 6 monthly installments with CDL Checkout (Credit Direct).

Get up to ₦1,000,000 in credit, subject to approval.

You'll be redirected to Credit Direct to complete your application.

Orders are processed after financing is approved.

Button:

Chat to use this option

---

Clicking button should open WhatsApp.

WhatsApp message should include:

Customer Name

Phone Number

Email

Delivery Address

Products

Quantities

Total Amount

Selected Delivery Method

Order ID

Preferred Payment:

Credit Direct

---

## 3. Klump

Same behaviour.

Preferred Payment:

Klump

---

# Customer Account

Registered users can

View orders

Track orders

Update profile

Change password

Wishlist

Addresses

---

# Admin Dashboard

---

## Dashboard

Show:

Revenue

Orders

Pending Orders

Delivered Orders

Cancelled Orders

Products

Customers

Recent Orders

Sales Chart

Low Stock

Out of Stock

---

## Product Management

Admin can

Create Product

Edit Product

Delete Product

Archive Product

Upload Images

Manage Variants

Bulk Upload

---

Product Fields

Name

Slug

Brand

Category

SKU

Description

Price

Discount Price

Quantity

Condition

Warranty

RAM

Storage

Processor

Battery

Camera

Display

Featured

New Arrival

Published

---

## Categories

CRUD

---

## Brands

CRUD

Upload Logo

---

## Inventory

Manage stock.

Stock History.

Low stock alerts.

---

## Orders

View Orders

Update Status

Print Invoice

Generate Receipt

Cancel Order

Refund

Assign Tracking Number

---

Order Status

Pending

Awaiting Payment

Paid

Processing

Ready for Pickup

Shipped

Delivered

Cancelled

Refunded

---

## Customers

View

Disable

Delete

Order History

---

## Reviews

Approve

Reject

Delete

Reply

---

## Coupons

Create

Edit

Delete

Percentage

Fixed Amount

Expiry

Usage Limit

Minimum Spend

---

## Homepage Manager

Manage

Hero

Featured Products

Flash Sales

Categories

Promotions

---

## Delivery Settings

Configure

BuyGadgets Delivery

- Fee
- Estimated Days

GIG Logistics

- Fee
- Estimated Days

Pickup

- Address
- Business Hours

---

## Payment Settings

Paystack

Public Key

Secret Key

---

Credit Direct

Enable

WhatsApp Number

Popup Message

---

Klump

Enable

WhatsApp Number

---

## Reports

Sales

Revenue

Inventory

Products

Customers

Export

CSV

Excel

PDF

---

## Users

Owner



---

Permissions

Role based access.

---

# Database Tables

profiles

categories

brands

products

product_images

product_variants

inventory

customers

addresses

orders

order_items

payments

delivery_methods

coupons

reviews

wishlists

compare_items

cart_items

settings

banners

notifications

admin_users

activity_logs

---

# Notifications

Customer

Order Confirmed

Payment Received

Order Shipped

Delivered

Ready for Pickup

---

Admin

New Order

Low Stock

Out of Stock

New Review

---

# WhatsApp Integration

For Credit Direct and Klump.

Generate formatted message.

Redirect to

https://wa.me/<store-number>?text=<encoded-message>

---

# Security

Protected admin routes.

Role based authorization.

Server-side validation.

Rate limiting.

CSRF protection.

Input sanitization.

---

# Performance

Use Server Components whenever possible.

Lazy load images.

Image optimization.

Pagination.

Caching.

Database indexing.

---

# SEO

Dynamic metadata.

OpenGraph.

Twitter Cards.

Structured Data.

XML Sitemap.

Robots.txt.

Canonical URLs.

---

# Project Folder Structure

app/

components/

features/

lib/

hooks/

services/

actions/

types/

prisma/

supabase/

public/

styles/

---


