import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="container py-12">
      <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">About Marketfy</h1>
          <p className="text-muted-foreground">Learn more about our marketplace</p>
        </div>
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Our Story</CardTitle>
            <CardDescription>How Marketfy began</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Marketfy was founded in 2023 with a simple mission: to create a marketplace where buyers and sellers can connect easily and securely. What started as a small platform has grown into a thriving marketplace with thousands of products and users.
            </p>
            <p>
              Our team is dedicated to providing the best possible experience for both buyers and sellers. We continuously improve our platform based on user feedback and market trends to ensure that Marketfy remains at the forefront of online marketplaces.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
            <CardDescription>What drives us forward</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              At Marketfy, our mission is to create a global marketplace that empowers entrepreneurs and provides consumers with access to unique products from around the world. We believe in fair trade, sustainable practices, and creating opportunities for businesses of all sizes.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Our Team</CardTitle>
            <CardDescription>The people behind Marketfy</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Our diverse team brings together expertise in technology, e-commerce, customer service, and logistics. We're united by our passion for creating an exceptional marketplace experience.
            </p>
            <p>
              Based in multiple locations around the world, our team works remotely to ensure that Marketfy operates smoothly 24/7, providing support to our global community of buyers and sellers.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Join Us</CardTitle>
            <CardDescription>Become part of our community</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Whether you're looking to buy unique products or sell your own creations, Marketfy welcomes you to our community. Join thousands of users who have already discovered the benefits of our marketplace.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button asChild>
                <Link href="/products">Browse Products</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
