import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

// Sample product data
const products = [
  {
    id: 1,
    name: "Premium Headphones",
    description: "High-quality wireless headphones with noise cancellation",
    price: 199.99,
    category: "Electronics",
  },
  {
    id: 2,
    name: "Ergonomic Office Chair",
    description: "Comfortable chair designed for long working hours",
    price: 249.99,
    category: "Furniture",
  },
  {
    id: 3,
    name: "Smartphone Pro Max",
    description: "Latest smartphone with advanced camera and long battery life",
    price: 899.99,
    category: "Electronics",
  },
  {
    id: 4,
    name: "Fitness Tracker",
    description: "Track your health metrics and exercise with this smart device",
    price: 89.99,
    category: "Fitness",
  },
  {
    id: 5,
    name: "Coffee Maker Deluxe",
    description: "Automatic coffee maker with multiple brewing options",
    price: 129.99,
    category: "Kitchen",
  },
  {
    id: 6,
    name: "Laptop Ultra",
    description: "Powerful laptop for work and entertainment",
    price: 1299.99,
    category: "Electronics",
  },
];

export default function ProductsPage() {
  return (
    <div className="container py-12">
      <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Browse our selection of products</p>
        </div>
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
              <CardDescription>{product.category}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{product.description}</p>
              <p className="font-bold mt-2">${product.price.toFixed(2)}</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Add to Cart</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
