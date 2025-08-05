import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-6">
      <div className="container mx-auto px-4">
        <div className="flex justify-between">
          <div>
            <p className="text-sm text-gray-600">© {new Date().getFullYear()} STORE. All Rights Reserved.</p>
          </div>
          <div className="flex space-x-4">
            <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-800">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-800">
              Terms of Service
            </Link>
            <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-800">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
