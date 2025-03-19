"use client"

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import {
  CheckCircle,
  XCircle,
  MessageSquare,
  Clock,
  Zap,
} from "lucide-react";// Assume you've moved your helper functions to a utils folder

interface NegotiationHistoryEntry {
  timestamp: string;
  actor: string;
  action: string;
  price?: number;
  quantity?: number;
  message?: string;
}

interface NegotiationActionsProps {
  negotiationHistory: NegotiationHistoryEntry[];
  inquiryStatus: string;
  timeRemaining: number | null;
  isUsersTurn: boolean;
  isBuyer: boolean;
  onAccept: () => void;
  onReject: () => void;
  onCounterOffer: () => void;
  onDelete?: () => void;
  onRevive?: () => void;
  originalMessage?: string;
}

const NegotiationHistoryAndActions: React.FC<NegotiationActionsProps> = ({
  negotiationHistory,
  inquiryStatus,
  timeRemaining,
  isUsersTurn,
  isBuyer,
  onAccept,
  onReject,
  onCounterOffer,
  onDelete,
  onRevive,
  originalMessage,
}) => {
  // Render action buttons based on status and turn
  const renderActionButtons = () => {
    if (inquiryStatus === "EXPIRED" && onRevive) {
      return (
        <Button 
          variant="outline" 
          className="border-blue-500 text-blue-500 hover:bg-blue-50"
          onClick={onRevive}
        >
          <Zap className="w-4 h-4 mr-2" /> Revive Negotiation
        </Button>
      );
    }
    
    if (inquiryStatus === "ACCEPTED") {
      // Only show Confirm Order button to the buyer
      if (isBuyer) {
        return (
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => alert("Order confirmed! Proceeding to fulfillment...")}
          >
            <CheckCircle className="w-4 h-4 mr-2" /> Confirm Order
          </Button>
        );
      } else {
        // For seller, show a different message or button
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
            <CheckCircle className="w-4 h-4 mr-2" /> Waiting for buyer confirmation
          </Badge>
        );
      }
    } else if (inquiryStatus === "PENDING" || inquiryStatus === "NEGOTIATING") {
      if (isUsersTurn) {
        return (
          <>
            <Button
              variant="outline"
              className="border-green-500 text-green-500 hover:bg-green-50"
              onClick={onAccept}
            >
              <CheckCircle className="w-4 h-4 mr-2" /> Accept Offer
            </Button>
            <Button
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-50"
              onClick={onReject}
            >
              <XCircle className="w-4 h-4 mr-2" /> Reject Offer
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={onCounterOffer}>
              <MessageSquare className="w-4 h-4 mr-2" /> Counter Offer
            </Button>
            {isBuyer && onDelete && (
              <Button
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-50"
                onClick={onDelete}
              >
                <XCircle className="w-4 h-4 mr-2" /> Delete Inquiry
              </Button>
            )}
          </>
        );
      } else {
        // The user who made the latest offer is waiting for a response
        return (
          <>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
              <Clock className="w-4 h-4 mr-2" /> Waiting for {isBuyer ? "seller" : "buyer"} response
            </Badge>
            {isBuyer && onDelete && (
              <Button
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-50 ml-2"
                onClick={onDelete}
              >
                <XCircle className="w-4 h-4 mr-2" /> Delete Inquiry
              </Button>
            )}
          </>
        );
      }
    } else {
      return (
        <Badge className="px-3 py-1">
          Inquiry {inquiryStatus}
        </Badge>
      );
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };
  

  return (
    <>
      {/* Original Message */}
      {originalMessage && (
        <div className="mb-6">
          <h3 className="text-md font-semibold mb-2">Inquiry Message</h3>
          <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-zinc-700/50 p-3 rounded">
            {originalMessage || "No message provided."}
          </p>
        </div>
      )}

      {/* Negotiation History */}
      <div className="mb-6 bg-white dark:bg-zinc-950 p-5 rounded-lg border border-gray-100 dark:border-zinc-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-primary" />
          Negotiation Timeline
        </h3>
        <div className="space-y-4">
          {negotiationHistory.map((entry, idx) => (
            <div key={idx} className="relative pl-6 pb-4 border-l-2 border-primary/30 dark:border-primary/20">
              <div className="absolute w-4 h-4 bg-primary rounded-full -left-[8px] top-1.5 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div className="flex items-start justify-between bg-gray-50 dark:bg-zinc-700/30 p-3 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {entry.actor} {entry.action.replace(/_/g, " ")}
                  </p>
                  {entry.price && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {entry.quantity} units at ${entry.price}/unit
                    </p>
                  )}
                  {entry.message && (
                    <p className="text-sm mt-2 bg-white dark:bg-zinc-700/50 p-2 rounded border border-gray-100 dark:border-zinc-600 italic">
                      "{entry.message}"
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatDate(entry.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 justify-end mt-6">
        {renderActionButtons()}
      </div>
    </>
  );
};

export default NegotiationHistoryAndActions;