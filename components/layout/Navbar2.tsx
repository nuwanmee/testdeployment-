'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Bell, User, Heart, MessageSquare, LogOut, Home, FileHeart } from 'lucide-react';
import useProposalStore from '@/store/proposalStore';
import { useRouter } from 'next/navigation';

const Sidebar: React.FC = () => {
  const { data: session } = useSession();
  const { pendingReceivedProposals, fetchUserProposals } = useProposalStore();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserProposals(Number(session.user.id));
    }
  }, [session, fetchUserProposals]);

  const hasNewProposals = pendingReceivedProposals.length > 0;

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  return (
    <div className="bg-white shadow-sm w-64 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b">
        <Link href="/" className="text-xl font-bold text-primary">
          MatrimonyApp
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="p-4 flex-grow">
        <ul className="space-y-2">
          <li>
            <Link href="/profiles" className="flex items-center space-x-3 text-gray-700 hover:text-primary transition p-2 rounded-md">
              <User size={16} />
              <span>Browse Profiles</span>
            </Link>
          </li>
          <li>
            <Link href="/proposals" className="flex items-center space-x-3 text-gray-700 hover:text-primary transition p-2 rounded-md">
              <FileHeart size={16} />
              <span>Proposals</span>
              {hasNewProposals && (
                <span className="ml-auto px-1.5 py-0.5 bg-red-100 text-red-800 rounded-full text-xs">
                  {pendingReceivedProposals.length}
                </span>
              )}
            </Link>
          </li>
          <li>
            <Link href="/messages" className="flex items-center space-x-3 text-gray-700 hover:text-primary transition p-2 rounded-md">
              <MessageSquare size={16} />
              <span>Messages</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* User Actions */}
      {session ? (
        <div className="p-4 border-t">
          <div className="relative mb-2">
            <button
              onClick={toggleNotifications}
              className="w-full flex items-center space-x-3 text-gray-700 hover:text-primary transition p-2 rounded-md"
            >
              <Bell size={16} />
              <span>Notifications</span>
              {hasNewProposals && (
                <span className="ml-auto px-1.5 py-0.5 bg-red-100 text-red-800 rounded-full text-xs">
                  {pendingReceivedProposals.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotificationsOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-10">
                <div className="px-4 py-2 border-b">
                  <h3 className="font-medium">Notifications</h3>
                </div>
                {hasNewProposals ? (
                  <div className="p-4">
                    <Link
                      href="/proposals/received"
                      className="block text-sm hover:bg-gray-100 p-2 rounded-md"
                      onClick={() => setIsNotificationsOpen(false)}
                    >
                      You have {pendingReceivedProposals.length} new proposal{pendingReceivedProposals.length > 1 ? 's' : ''}
                    </Link>
                  </div>
                ) : (
                  <div className="p-4 text-sm text-gray-500">
                    No new notifications
                  </div>
                )}
              </div>
            )}
          </div>

          <Link
            href={`/profile`}
            className="block w-full flex items-center space-x-3 text-gray-700 hover:text-primary transition p-2 rounded-md"
          >
            {session.user?.image ? (
              <img
                src={session.user.image}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <User size={16} />
            )}
            <span>My Profile</span>
          </Link>
          <Link
            href="/proposals/sent"
            className="block w-full flex items-center space-x-3 text-gray-700 hover:text-primary transition p-2 rounded-md"
          >
            <Heart size={16} />
            <span>Sent Proposals</span>
          </Link>
          <Link
            href="/proposals/received"
            className="block w-full flex items-center space-x-3 text-gray-700 hover:text-primary transition p-2 rounded-md"
          >
            <FileHeart size={16} />
            <span>Received Proposals</span>
            {hasNewProposals && (
              <span className="ml-auto px-1.5 py-0.5 bg-red-100 text-red-800 rounded-full text-xs">
                {pendingReceivedProposals.length}
              </span>
            )}
          </Link>
          {/* <button
            onClick={() => signOut()}
            className="block w-full flex items-center space-x-3 text-gray-700 hover:text-primary transition p-2 rounded-md"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button> */}
        </div>
      ) : (
        <div className="p-4 border-t">
          <Link
            href="/login"
            className="block w-full text-center py-2 text-gray-700 hover:text-primary transition rounded-md"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="block w-full text-center py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition mt-2"
          >
            Register
          </Link>
        </div>
      )}
    </div>
  );
};

export default Sidebar;