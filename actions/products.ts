"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";

import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFile, pathFromPublicUrl, uploadFile } from "@/lib/supabase/storage";
import { productSchema, type ProductValues } from "@/lib/validations/product";
import type { ActionResult } from "@/types";

function toProductData(values: ProductValues) {
  return {
    name: values.name,
    slug: values.slug,
    brandId: values.brandId || null,
    categoryId: values.categoryId || null,
    sku: values.sku,
    description: values.description || null,
    price: values.price,
    discountPrice: values.discountPrice ?? null,
    flashSaleEndsAt: values.flashSaleEndsAt ? new Date(values.flashSaleEndsAt) : null,
    quantity: values.quantity,
    condition: values.condition,
    warranty: values.warranty || null,
    ram: values.ram || null,
    storage: values.storage || null,
    processor: values.processor || null,
    battery: values.battery || null,
    camera: values.camera || null,
    display: values.display || null,
    featured: values.featured,
    newArrival: values.newArrival,
    published: values.published,
  };
}

export async function createProduct(
  values: ProductValues,
): Promise<ActionResult<{ id: string }>> {
  await getAdminSession();
  const parsed = productSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Check the form for errors." };
  }

  let product;
  try {
    product = await prisma.product.create({ data: toProductData(parsed.data) });
  } catch {
    return {
      success: false,
      error: "A product with that slug or SKU already exists.",
    };
  }

  revalidatePath("/admin/products");
  return { success: true, data: { id: product.id } };
}

export async function updateProduct(
  id: string,
  values: ProductValues,
): Promise<ActionResult> {
  await getAdminSession();
  const parsed = productSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Check the form for errors." };
  }

  const existingVariants = await prisma.productVariant.findMany({
    where: { productId: id },
    select: { id: true },
  });
  const existingIds = new Set(existingVariants.map((v) => v.id));
  const incomingIds = new Set(
    parsed.data.variants.filter((v) => v.id).map((v) => v.id as string),
  );
  const idsToDelete = [...existingIds].filter((vid) => !incomingIds.has(vid));

  try {
    await prisma.$transaction([
      prisma.product.update({ where: { id }, data: toProductData(parsed.data) }),
      ...(idsToDelete.length
        ? [prisma.productVariant.deleteMany({ where: { id: { in: idsToDelete } } })]
        : []),
      ...parsed.data.variants.map((variant) => {
        const attributes = Object.fromEntries(
          variant.attributes.map((a) => [a.key, a.value]),
        );
        const data = {
          productId: id,
          name: variant.name,
          sku: variant.sku,
          price: variant.price ?? null,
          quantity: variant.quantity,
          attributes,
        };
        return variant.id
          ? prisma.productVariant.update({ where: { id: variant.id }, data })
          : prisma.productVariant.create({ data });
      }),
    ]);
  } catch {
    return {
      success: false,
      error: "Check the product and variant SKUs/slug for duplicates.",
    };
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  return { success: true, data: undefined };
}

export async function toggleArchiveProduct(
  id: string,
  archived: boolean,
): Promise<ActionResult> {
  await getAdminSession();
  await prisma.product.update({ where: { id }, data: { archived } });
  revalidatePath("/admin/products");
  return { success: true, data: undefined };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  await getAdminSession();

  const images = await prisma.productImage.findMany({
    where: { productId: id },
    select: { url: true },
  });
  await prisma.product.delete({ where: { id } });

  await Promise.all(
    images.map(async (image) => {
      const path = pathFromPublicUrl(image.url);
      if (path) await deleteFile(path);
    }),
  );

  revalidatePath("/admin/products");
  return { success: true, data: undefined };
}

export async function uploadProductImages(
  productId: string,
  formData: FormData,
): Promise<ActionResult> {
  await getAdminSession();

  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) {
    return { success: false, error: "No files provided." };
  }

  const lastPosition = await prisma.productImage.count({ where: { productId } });

  const urls = await Promise.all(
    files.map((file) => {
      const ext = file.name.split(".").pop() ?? "jpg";
      return uploadFile(file, `products/${productId}/${randomUUID()}.${ext}`);
    }),
  );

  await prisma.productImage.createMany({
    data: urls.map((url, index) => ({
      productId,
      url,
      position: lastPosition + index,
    })),
  });

  revalidatePath(`/admin/products/${productId}`);
  return { success: true, data: undefined };
}

export async function deleteProductImage(imageId: string): Promise<ActionResult> {
  await getAdminSession();

  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!image) {
    return { success: false, error: "Image not found." };
  }

  await prisma.productImage.delete({ where: { id: imageId } });

  const path = pathFromPublicUrl(image.url);
  if (path) await deleteFile(path);

  revalidatePath(`/admin/products/${image.productId}`);
  return { success: true, data: undefined };
}
