'use client'

import React, { useState } from 'react'
import { CMSLink, type CMSLinkType } from '@/components/Link'
import './megaMenu.css'

// Types for the mega menu structure
type Link = Omit<CMSLinkType, 'children' | 'appearance' | 'className' | 'size' | 'onClick'>

type Badge = {
  text: string
  style?: 'default' | 'primary' | 'secondary' | null
}

type NestedPage = {
  label: string
  link?: Link | null
  tags?: Badge[] | null
}

type PageItem = {
  label: string
  type?: 'page' | 'nested' | null
  link?: Link | null
  tags?: Badge[] | null
  nestedItems?: NestedPage[] | null
}

type SubSubCategory = {
  label: string
  items?: {
    label: string
    link?: Link | null
    tags?: Badge[] | null
  }[] | null
}

type SubCategory = {
  label: string
  type?: 'subcategory' | 'link' | null
  link?: Link | null
  subSubs?: SubSubCategory[] | null
  items?: PageItem[] | null
}

type NavCategory = {
  label: string
  subs?: SubCategory[] | null
}

type MegaMenuDropdownProps = {
  category: NavCategory
  isOpen: boolean
  onCloseAction: () => void
}

export const MegaMenuDropdown: React.FC<MegaMenuDropdownProps> = ({
  category,
  isOpen,
  onCloseAction,
}) => {
  const [activeSub, setActiveSub] = useState<number>(0)
  const [activeSubSub, setActiveSubSub] = useState<number>(0)
  const [activeNested, setActiveNested] = useState<number | null>(null)

  if (!isOpen || !category.subs || category.subs.length === 0) {
    return null
  }

  const currentSub = category.subs[activeSub]
  const hasSubSubcategories = currentSub?.type === 'subcategory' && currentSub.subSubs && currentSub.subSubs.length > 0
  const hasNestedSubcategories =
    currentSub?.type === 'subcategory' &&
    currentSub.items?.some((item) => item.type === 'nested')

  return (
    <>
      {/* Overlay to close dropdown when clicking outside */}
      <div className="mega-menu-overlay" onClick={onCloseAction} />

      {/* Dropdown panel */}
      <div className="mega-menu-dropdown">
        <div className="mega-menu-container">
          {/* Left sidebar - 30% */}
          <div className="mega-menu-sidebar">
            <nav>
              <ul className="mega-menu-sidebar-list">
                {category.subs.map((sub, index) => (
                  <li key={index}>
                    {sub.type === 'link' ? (
                      // Direct link - no submenu
                      <CMSLink
                        {...sub.link}
                        className="mega-menu-sidebar-item"
                        onClick={onCloseAction}
                      >
                        {sub.label}
                      </CMSLink>
                    ) : (
                      // Subcategory with items
                      <button
                        className={`mega-menu-sidebar-item ${activeSub === index ? 'active' : ''}`}
                        onClick={() => {
                          setActiveSub(index)
                          setActiveNested(null)
                          setActiveSubSub(0)
                        }}
                        onMouseEnter={() => {
                          setActiveSub(index)
                          setActiveNested(null)
                          setActiveSubSub(0)
                        }}
                      >
                        {sub.label}
                        <svg
                          className="mega-menu-arrow"
                          width="8"
                          height="12"
                          viewBox="0 0 8 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M1.5 1L6.5 6L1.5 11"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Right content area - 70% */}
          <div className="mega-menu-content">
            {currentSub?.type === 'subcategory' && (
              <>
                {/* Check if we have sub-subcategories */}
                {hasSubSubcategories && currentSub.subSubs ? (
                  // Three-column layout: subcategories in sidebar, sub-subcategories in middle, pages on right
                  <div className="mega-menu-nested-layout">
                    {/* Middle column: Sub-subcategories */}
                    <div className="mega-menu-nested-sidebar">
                      <ul className="mega-menu-nested-list">
                        {currentSub.subSubs.map((subSub, subSubIndex) => (
                          <li key={subSubIndex}>
                            <button
                              className={`mega-menu-nested-item ${activeSubSub === subSubIndex ? 'active' : ''}`}
                              onClick={() => setActiveSubSub(subSubIndex)}
                              onMouseEnter={() => setActiveSubSub(subSubIndex)}
                            >
                              {subSub.label}
                              <svg
                                className="mega-menu-arrow"
                                width="8"
                                height="12"
                                viewBox="0 0 8 12"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M1.5 1L6.5 6L1.5 11"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Right column: Pages from active sub-subcategory */}
                    <div className="mega-menu-nested-content">
                      {currentSub.subSubs[activeSubSub]?.items && (
                        <ul className="mega-menu-page-list">
                          {currentSub.subSubs[activeSubSub].items.map((page, pageIndex) => (
                            <li key={pageIndex} className="mega-menu-page-item">
                              <CMSLink
                                {...page.link}
                                className="mega-menu-page-link"
                                onClick={onCloseAction}
                              >
                                <span className="mega-menu-page-label">{page.label}</span>
                                {page.tags && page.tags.length > 0 && (
                                  <div className="mega-menu-badges">
                                    {page.tags.map((tag, tagIndex) => (
                                      <span
                                        key={tagIndex}
                                        className={`mega-menu-badge badge-${tag.style || 'default'}`}
                                      >
                                        {tag.text}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </CMSLink>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ) : hasNestedSubcategories && currentSub.items ? (
                  // Two-column layout: nested subcategories on left, their content on right
                  <div className="mega-menu-nested-layout">
                    {/* Middle column: Nested subcategories */}
                    <div className="mega-menu-nested-sidebar">
                      <ul className="mega-menu-nested-list">
                        {currentSub.items.map((item, itemIndex) => {
                          if (item.type === 'nested' && item.nestedItems) {
                            return (
                              <li key={itemIndex}>
                                <button
                                  className={`mega-menu-nested-item ${activeNested === itemIndex ? 'active' : ''}`}
                                  onClick={() => setActiveNested(itemIndex)}
                                  onMouseEnter={() => setActiveNested(itemIndex)}
                                >
                                  {item.label}
                                  <svg
                                    className="mega-menu-arrow"
                                    width="8"
                                    height="12"
                                    viewBox="0 0 8 12"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M1.5 1L6.5 6L1.5 11"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </button>
                              </li>
                            )
                          } else if (item.type === 'page' && item.link) {
                            return (
                              <li key={itemIndex}>
                                <CMSLink
                                  {...item.link}
                                  className="mega-menu-nested-item"
                                  onClick={onCloseAction}
                                >
                                  <span>{item.label}</span>
                                  {item.tags && item.tags.length > 0 && (
                                    <span className="mega-menu-badges">
                                      {item.tags.map((tag, tagIndex) => (
                                        <span
                                          key={tagIndex}
                                          className={`mega-menu-badge badge-${tag.style || 'default'}`}
                                        >
                                          {tag.text}
                                        </span>
                                      ))}
                                    </span>
                                  )}
                                </CMSLink>
                              </li>
                            )
                          }
                          return null
                        })}
                      </ul>
                    </div>

                    {/* Right column: Nested subcategory content */}
                    <div className="mega-menu-nested-content">
                      {activeNested !== null &&
                        currentSub.items[activeNested]?.type === 'nested' &&
                        currentSub.items[activeNested].nestedItems && (
                          <ul className="mega-menu-page-list">
                            {currentSub.items[activeNested].nestedItems!.map(
                              (nestedPage, nestedIndex) => (
                                <li key={nestedIndex} className="mega-menu-page-item">
                                  <CMSLink
                                    {...nestedPage.link}
                                    className="mega-menu-page-link"
                                    onClick={onCloseAction}
                                  >
                                    <span className="mega-menu-page-label">
                                      {nestedPage.label}
                                    </span>
                                    {nestedPage.tags && nestedPage.tags.length > 0 && (
                                      <span className="mega-menu-badges">
                                        {nestedPage.tags.map((tag, tagIndex) => (
                                          <span
                                            key={tagIndex}
                                            className={`mega-menu-badge badge-${tag.style || 'default'}`}
                                          >
                                            {tag.text}
                                          </span>
                                        ))}
                                      </span>
                                    )}
                                  </CMSLink>
                                </li>
                              ),
                            )}
                          </ul>
                        )}
                    </div>
                  </div>
                ) : (
                  // Simple grid for pages without nested subcategories or sub-subcategories
                  <div className="mega-menu-grid">
                    {currentSub.items &&
                      currentSub.items.map((item, itemIndex) => {
                        if (item.type === 'page' && item.link) {
                          return (
                          <div key={itemIndex} className="mega-menu-page-item">
                            <CMSLink
                              {...item.link}
                              className="mega-menu-page-link"
                              onClick={onCloseAction}
                            >
                              <span className="mega-menu-page-label">{item.label}</span>
                              {item.tags && item.tags.length > 0 && (
                                <span className="mega-menu-badges">
                                  {item.tags.map((tag, tagIndex) => (
                                    <span
                                      key={tagIndex}
                                      className={`mega-menu-badge badge-${tag.style || 'default'}`}
                                    >
                                      {tag.text}
                                    </span>
                                  ))}
                                </span>
                              )}
                            </CMSLink>
                          </div>
                        )
                      }
                      return null
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
