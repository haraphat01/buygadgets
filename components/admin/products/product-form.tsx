"use client";

import { useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import { createProduct, updateProduct } from "@/actions/products";
import {
  PRODUCT_CONDITIONS,
  productSchema,
  type ProductFormInput,
  type ProductValues,
} from "@/lib/validations/product";
import { slugify } from "@/lib/slug";
import { toDatetimeLocalInput } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ProductImageUploader } from "@/components/admin/products/product-image-uploader";
import type { ProductWithRelations } from "@/services/products";

type Option = { id: string; name: string };

function defaultValuesFrom(product?: ProductWithRelations): ProductFormInput {
  if (!product) {
    return {
      name: "",
      slug: "",
      brandId: null,
      categoryId: null,
      sku: "",
      description: "",
      price: 0,
      discountPrice: null,
      flashSaleEndsAt: "",
      quantity: 0,
      condition: "NEW",
      warranty: "",
      ram: "",
      storage: "",
      processor: "",
      battery: "",
      camera: "",
      display: "",
      featured: false,
      newArrival: false,
      published: false,
      variants: [],
    };
  }

  return {
    name: product.name,
    slug: product.slug,
    brandId: product.brandId,
    categoryId: product.categoryId,
    sku: product.sku,
    description: product.description ?? "",
    price: Number(product.price),
    discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
    flashSaleEndsAt: toDatetimeLocalInput(product.flashSaleEndsAt),
    quantity: product.quantity,
    condition: product.condition,
    warranty: product.warranty ?? "",
    ram: product.ram ?? "",
    storage: product.storage ?? "",
    processor: product.processor ?? "",
    battery: product.battery ?? "",
    camera: product.camera ?? "",
    display: product.display ?? "",
    featured: product.featured,
    newArrival: product.newArrival,
    published: product.published,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      sku: variant.sku,
      price: variant.price ? Number(variant.price) : null,
      quantity: variant.quantity,
      attributes: Object.entries(
        (variant.attributes as Record<string, string> | null) ?? {},
      ).map(([key, value]) => ({ key, value })),
    })),
  };
}

export function ProductForm({
  mode,
  product,
  categories,
  brands,
}: {
  mode: "create" | "edit";
  product?: ProductWithRelations;
  categories: Option[];
  brands: Option[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [slugEdited, setSlugEdited] = useState(mode === "edit");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<ProductFormInput, unknown, ProductValues>({
    resolver: zodResolver(productSchema),
    defaultValues: defaultValuesFrom(product),
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } =
    useFieldArray({ control, name: "variants" });

  const brandId = watch("brandId");
  const categoryId = watch("categoryId");
  const condition = watch("condition");

  function onSubmit(values: ProductValues) {
    startTransition(async () => {
      if (mode === "create") {
        const result = await createProduct(values);
        if (result.success) {
          toast.success("Product created. Add images and variants below.");
          router.push(`/admin/products/${result.data.id}`);
        } else {
          toast.error(result.error);
        }
        return;
      }

      const result = await updateProduct(product!.id, values);
      if (result.success) {
        toast.success("Product saved.");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">
          {mode === "create" ? "New Product" : product!.name}
        </h1>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : mode === "create" ? "Create Product" : "Save Changes"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basic info</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register("name", {
                onChange: (e) => {
                  if (!slugEdited) setValue("slug", slugify(e.target.value));
                },
              })}
              aria-invalid={!!errors.name}
            />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              {...register("slug", { onChange: () => setSlugEdited(true) })}
              aria-invalid={!!errors.slug}
            />
            {errors.slug ? <p className="text-sm text-destructive">{errors.slug.message}</p> : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" {...register("sku")} aria-invalid={!!errors.sku} />
            {errors.sku ? <p className="text-sm text-destructive">{errors.sku.message}</p> : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Condition</Label>
            <Select value={condition} onValueChange={(v) => setValue("condition", v as ProductValues["condition"])}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CONDITIONS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c.charAt(0) + c.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Brand</Label>
            <Select
              value={brandId ?? "none"}
              onValueChange={(v) => setValue("brandId", v === "none" ? null : (v as string))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {brands.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Category</Label>
            <Select
              value={categoryId ?? "none"}
              onValueChange={(v) => setValue("categoryId", v === "none" ? null : (v as string))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={4} {...register("description")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pricing & stock</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="price">Price (₦)</Label>
            <Input id="price" type="number" step="0.01" {...register("price")} aria-invalid={!!errors.price} />
            {errors.price ? <p className="text-sm text-destructive">{errors.price.message}</p> : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="discountPrice">Discount price (₦)</Label>
            <Input id="discountPrice" type="number" step="0.01" {...register("discountPrice")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="quantity">Quantity</Label>
            <Input id="quantity" type="number" {...register("quantity")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="flashSaleEndsAt">Flash sale ends</Label>
            <Input id="flashSaleEndsAt" type="datetime-local" {...register("flashSaleEndsAt")} />
            <p className="text-xs text-muted-foreground">
              Set alongside a discount price to run a flash sale — also manageable from Homepage Manager.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Specifications</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="warranty">Warranty</Label>
            <Input id="warranty" {...register("warranty")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ram">RAM</Label>
            <Input id="ram" {...register("ram")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="storage">Storage</Label>
            <Input id="storage" {...register("storage")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="processor">Processor</Label>
            <Input id="processor" {...register("processor")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="battery">Battery</Label>
            <Input id="battery" {...register("battery")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="camera">Camera</Label>
            <Input id="camera" {...register("camera")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="display">Display</Label>
            <Input id="display" {...register("display")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Visibility</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={watch("featured")}
              onCheckedChange={(v) => setValue("featured", v)}
            />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={watch("newArrival")}
              onCheckedChange={(v) => setValue("newArrival", v)}
            />
            New Arrival
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={watch("published")}
              onCheckedChange={(v) => setValue("published", v)}
            />
            Published
          </label>
        </CardContent>
      </Card>

      {mode === "edit" && product ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Images</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductImageUploader productId={product.id} images={product.images} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            Save the product to add images.
          </CardContent>
        </Card>
      )}

      {mode === "edit" && product ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Variants</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendVariant({ name: "", sku: "", price: null, quantity: 0, attributes: [] })
              }
            >
              <Plus className="size-4" />
              Add Variant
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {variantFields.length === 0 ? (
              <p className="text-sm text-muted-foreground">No variants yet.</p>
            ) : (
              variantFields.map((field, index) => (
                <VariantRow
                  key={field.id}
                  control={control}
                  register={register}
                  index={index}
                  onRemove={() => removeVariant(index)}
                  errors={errors}
                />
              ))
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            Save the product to add variants.
          </CardContent>
        </Card>
      )}
    </form>
  );
}

function VariantRow({
  control,
  register,
  index,
  onRemove,
  errors,
}: {
  control: ReturnType<typeof useForm<ProductFormInput, unknown, ProductValues>>["control"];
  register: ReturnType<typeof useForm<ProductFormInput, unknown, ProductValues>>["register"];
  index: number;
  onRemove: () => void;
  errors: ReturnType<
    typeof useForm<ProductFormInput, unknown, ProductValues>
  >["formState"]["errors"];
}) {
  const {
    fields: attributeFields,
    append: appendAttribute,
    remove: removeAttribute,
  } = useFieldArray({ control, name: `variants.${index}.attributes` });

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <Label>Name</Label>
          <Input {...register(`variants.${index}.name`)} placeholder="e.g. Black / 256GB" />
          {errors.variants?.[index]?.name ? (
            <p className="text-sm text-destructive">{errors.variants[index]?.name?.message}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>SKU</Label>
          <Input {...register(`variants.${index}.sku`)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Price override (₦)</Label>
          <Input type="number" step="0.01" {...register(`variants.${index}.price`)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Quantity</Label>
          <Input type="number" {...register(`variants.${index}.quantity`)} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Attributes</Label>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => appendAttribute({ key: "", value: "" })}
          >
            <Plus className="size-3" />
            Add attribute
          </Button>
        </div>
        {attributeFields.map((attr, attrIndex) => (
          <div key={attr.id} className="flex items-center gap-2">
            <Input
              placeholder="Color"
              {...register(`variants.${index}.attributes.${attrIndex}.key`)}
            />
            <Input
              placeholder="Black"
              {...register(`variants.${index}.attributes.${attrIndex}.value`)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => removeAttribute(attrIndex)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button type="button" variant="destructive" size="sm" onClick={onRemove}>
          <Trash2 className="size-4" />
          Remove Variant
        </Button>
      </div>
    </div>
  );
}
