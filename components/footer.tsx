"use client"

import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react"
import { useSiteSettings } from "@/context/site-settings-context"

export default function Footer() {
  const { settings, isLoading } = useSiteSettings()

  const footerLinks = [
    {
      title: "Аялалууд",
      links: [
        { name: "Бүх аялалууд", href: "/tours" },
        { name: "Дотоодын аялал", href: "/tours?type=domestic" },
        { name: "Гадаад аялал", href: "/tours?type=international" },
        { name: "Хямдралтай аялалууд", href: "/tours?discount=true" },
      ],
    },
    {
      title: "Тусламж",
      links: [
        { name: "Түгээмэл асуултууд", href: "/faq" },
        { name: "Аяллын нөхцөл", href: "/terms" },
        { name: "Нууцлалын бодлого", href: "/privacy" },
        { name: "Холбоо барих", href: "/contact" },
      ],
    },
  ]

  const renderSocialIcon = (platform: string) => {
    switch (platform) {
      case "facebook":
        return <Facebook className="h-5 w-5" />
      case "instagram":
        return <Instagram className="h-5 w-5" />
      case "twitter":
        return <Twitter className="h-5 w-5" />
      case "youtube":
        return <Youtube className="h-5 w-5" />
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <footer className="bg-gray-100 pt-12 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="animate-pulse">
              <div className="h-8 w-32 bg-gray-300 rounded mb-4"></div>
              <div className="h-4 w-full bg-gray-300 rounded mb-2"></div>
              <div className="h-4 w-3/4 bg-gray-300 rounded mb-4"></div>
              <div className="flex space-x-4 mt-4">
                <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
                <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
                <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
              </div>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-6 w-24 bg-gray-300 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-300 rounded"></div>
                  <div className="h-4 w-40 bg-gray-300 rounded"></div>
                  <div className="h-4 w-36 bg-gray-300 rounded"></div>
                  <div className="h-4 w-28 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 mt-12 pt-8 text-center animate-pulse">
            <div className="h-4 w-64 bg-gray-300 rounded mx-auto"></div>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="bg-gray-100 pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              {settings.logoUrl ? (
                <Image
                  src={settings.logoUrl || "/placeholder.svg"}
                  alt={settings.siteName}
                  width={40}
                  height={40}
                  className="object-contain"
                />
              ) : null}
              <span className="text-xl font-bold text-blue-600">{settings.siteName}</span>
            </div>
            <p className="text-gray-600 mb-4">{settings.siteDescription}</p>
            <div className="flex space-x-4 mt-4">
              {settings.socialLinks &&
                Object.entries(settings.socialLinks).map(
                  ([platform, url]) =>
                    url && (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-blue-600 transition-colors"
                        aria-label={`Visit our ${platform} page`}
                      >
                        {renderSocialIcon(platform)}
                      </a>
                    ),
                )}
            </div>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-gray-900 mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-gray-600 hover:text-blue-600 transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Холбоо барих</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <span className="text-gray-600">{settings.address}</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-blue-600 mr-2" />
                <a
                  href={`tel:${settings.contactPhone}`}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {settings.contactPhone}
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-blue-600 mr-2" />
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {settings.contactEmail}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} {settings.siteName}. Бүх эрх хуулиар хамгаалагдсан.
          </p>
        </div>
      </div>
    </footer>
  )
}
