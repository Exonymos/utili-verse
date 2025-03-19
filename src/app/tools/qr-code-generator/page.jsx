// src/app/tools/qr-code-generator/page.jsx
"use client";
import React, { useState, useRef, useEffect } from "react";
import QRCode from "react-qr-code";
import { FiCopy, FiShare2, FiCheck, FiChevronDown } from "react-icons/fi";
import { motion } from "framer-motion";
import domtoimage from "dom-to-image";
import UsageModal from "../../../components/UsageModal";
import toolsData from "../../../data/tools.json";
import useLocalStorage from "../../../hooks/useLocalStorage";
import ToolInfo from "../../../components/ToolInfo";

export default function QRCodeGeneratorPage() {
  // State hooks for managing input and results
  const [inputText, setInputText] = useLocalStorage("tool_qrcode_input", "");
  const [qrValue, setQRValue] = useState("");
  const [usageModalOpen, setUsageModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [qrColor, setQrColor] = useState("#000000");
  const [qrBgColor, setQrBgColor] = useState("#ffffff");
  const [qrSize, setQrSize] = useState(128);
  const [autoGenerate, setAutoGenerate] = useState(false);
  const qrRef = useRef(null);

  const tool = toolsData.find((t) => t.id === "qr-code-generator");

  // Auto-generate QR code
  useEffect(() => {
    if (autoGenerate) {
      const handler = setTimeout(() => {
        setQRValue(inputText);
      }, 500);
      return () => clearTimeout(handler);
    }
  }, [inputText, autoGenerate]);

  // Function to generate QR code
  const generateQRCode = () => {
    setQRValue(inputText);
  };

  // Function to reset all input fields and results
  const resetFields = () => {
    setInputText("");
    setQRValue("");
    setQrColor("#000000");
    setQrBgColor("#ffffff");
    setQrSize(128);
  };

  // Function to copy input text to clipboard
  const copyInputText = async () => {
    try {
      await navigator.clipboard.writeText(inputText);
      showToast("Input text copied!");
    } catch (error) {
      console.error("Copy text failed", error);
      showToast("Copy text failed.");
    }
  };

  // Function to download QR code as SVG
  const downloadQRCodeSVG = () => {
    if (qrRef.current) {
      const svg = qrRef.current.querySelector("svg");
      if (svg) {
        const serializer = new XMLSerializer();
        const svgStr = serializer.serializeToString(svg);
        const blob = new Blob([svgStr], {
          type: "image/svg+xml;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "qr-code.svg";
        link.click();
        URL.revokeObjectURL(url);
        showToast("SVG downloaded!");
      }
    }
  };

  // Function to show toast notification
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 1500);
  };

  // Function to export QR code as PNG
  const exportQRCodeAsPNG = async () => {
    if (!qrRef.current) return null;
    try {
      const dataUrl = await domtoimage.toPng(qrRef.current);
      return dataUrl;
    } catch (error) {
      console.error("Error converting to PNG", error);
      return null;
    }
  };

  // Function to download QR code as PNG
  const downloadQRCode = async () => {
    const dataUrl = await exportQRCodeAsPNG();
    if (dataUrl) {
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "qr-code.png";
      link.click();
      showToast("PNG downloaded!");
    }
  };

  // Function to copy QR code image to clipboard
  const copyQRCode = async () => {
    const dataUrl = await exportQRCodeAsPNG();
    if (dataUrl) {
      try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        showToast("Image copied!");
      } catch (err) {
        console.error("Failed to copy image", err);
        showToast("Copy failed.");
      }
    }
  };

  // Function to share QR code image
  const shareQRCode = async () => {
    const dataUrl = await exportQRCodeAsPNG();
    if (dataUrl) {
      try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], "qr-code.png", { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "QR Code",
            text: "Here is your QR code.",
          });
          showToast("Shared!");
        } else {
          showToast("Sharing not supported.");
        }
      } catch (error) {
        console.error("Share failed", error);
      }
    }
  };

  // Usage instructions for the tool
  const usageInstructions = (
    <div>
      <p>To generate a QR code:</p>
      <ul className="list-disc ml-5">
        <li>Enter text or URL in the input field.</li>
        <li>Customize the QR code colors and size using the controls below.</li>
        <li>
          Use the Generate button to create the QR code or enable
          auto-generation.
        </li>
        <li>
          Use the Download dropdown to save the QR code as PNG or SVG. You can
          also copy the QR code image or share it directly.
        </li>
      </ul>
      <p>
        This tool uses <code>react-qr-code</code> and <code>dom-to-image</code>.
      </p>
    </div>
  );

  return (
    <div className="container mx-auto my-8">
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <ToolInfo tool={tool} onHowToUse={() => setUsageModalOpen(true)} />

          <div className="card bg-base-100 shadow-xl p-6">
            <div className="card-body text-center">
              {/* Input field */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Enter text or URL:</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter text or URL..."
                  className="input input-bordered w-full max-w-xs"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </div>

              {/* Auto Generate toggle, Copy Input & Reset buttons */}
              <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-4">
                <label className="cursor-pointer label">
                  <span className="label-text">Auto Generate</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={autoGenerate}
                    onChange={(e) => setAutoGenerate(e.target.checked)}
                  />
                </label>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  className="btn btn-outline"
                  onClick={copyInputText}
                >
                  Copy Input
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  className="btn btn-outline"
                  onClick={resetFields}
                >
                  Reset
                </motion.button>
              </div>

              {/* Color pickers */}
              <div className="flex flex-col md:flex-row gap-4 mb-4 justify-center">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Foreground Color:</span>
                  </label>
                  <input
                    type="color"
                    value={qrColor}
                    onChange={(e) => setQrColor(e.target.value)}
                    className="input input-bordered"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Background Color:</span>
                  </label>
                  <input
                    type="color"
                    value={qrBgColor}
                    onChange={(e) => setQrBgColor(e.target.value)}
                    className="input input-bordered"
                  />
                </div>
              </div>

              {/* QR Code size slider */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">QR Code Size: {qrSize}px</span>
                </label>
                <input
                  type="range"
                  min="64"
                  max="256"
                  value={qrSize}
                  onChange={(e) => setQrSize(Number(e.target.value))}
                  className="range range-primary"
                />
              </div>

              {/* Generate button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="btn btn-primary mb-4"
                onClick={generateQRCode}
              >
                Generate <FiCheck className="ml-2" />
              </motion.button>

              {/* QR Code preview and actions */}
              {qrValue && (
                <div className="flex flex-col items-center gap-4 mt-8">
                  <div
                    ref={qrRef}
                    id="qr-code-svg"
                    className="bg-white p-4 rounded shadow-lg"
                  >
                    <QRCode
                      value={qrValue}
                      size={qrSize}
                      fgColor={qrColor}
                      bgColor={qrBgColor}
                    />
                  </div>
                  <div className="flex flex-col gap-4 w-full">
                    {/* Download dropdown */}
                    <div className="w-full">
                      <div className="dropdown">
                        <motion.button whileHover={{ x: 5 }} className="w-full">
                          <label
                            tabIndex={0}
                            className="btn btn-primary w-full"
                          >
                            Download <FiChevronDown />
                          </label>
                        </motion.button>
                        <ul
                          tabIndex={0}
                          className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-full"
                        >
                          <li>
                            <button onClick={downloadQRCode}>
                              Download PNG
                            </button>
                          </li>
                          <li>
                            <button onClick={downloadQRCodeSVG}>
                              Download SVG
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                    {/* Copy and Share buttons */}
                    <div className="flex flex-col md:flex-row gap-4 w-full">
                      <motion.button
                        whileHover={{ x: 5 }}
                        className="btn btn-secondary flex-1"
                        onClick={copyQRCode}
                      >
                        Copy Image <FiCopy />
                      </motion.button>
                      <motion.button
                        whileHover={{ x: 5 }}
                        className="btn btn-accent flex-1"
                        onClick={shareQRCode}
                      >
                        Share <FiShare2 className="ml-2" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {toastMsg && (
        <div className="toast toast-center">
          <div className="alert alert-info">{toastMsg}</div>
        </div>
      )}

      {/* Usage modal */}
      {usageModalOpen && (
        <UsageModal
          onClose={() => setUsageModalOpen(false)}
          instructions={usageInstructions}
        />
      )}
    </div>
  );
}
