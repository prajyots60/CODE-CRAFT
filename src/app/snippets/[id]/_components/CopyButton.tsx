"use client"
import { Check, Copy } from 'lucide-react';
import React, { useState } from 'react'

function CopyButton({code} : {code:string}) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async() => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
    onClick={copyToClipboard}
    type='button'
    className='p-2 rounded-lg hover:bg-white/10 transition-all duration-200 group relative'
    >
      {copied ? (
        <Check className='size-4 text-green-300' />
      ) : (
        <Copy className='size-4 text-gray-400 group-hover:text-gray-300' />
      )}
    </button>
  )
}

export default CopyButton