'use client';

import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DotLottiePlayer } from '@dotlottie/react-player';
import '@dotlottie/react-player/dist/index.css';

export default function UnifiedDialog({
    isOpen,
    type = 'info',
    title,
    message,
    actions = [],
    onClose,
    autoClose,
    icon,
    showAnimation = true,
    animationSize = 64,
    children
}) {
    useEffect(() => {
        if (isOpen && autoClose) {
            const timer = setTimeout(() => {
                onClose?.();
            }, autoClose);
            return () => clearTimeout(timer);
        }
    }, [isOpen, autoClose, onClose]);

    // Define icon and color based on type
    const typeConfig = {
        success: {
            icon: CheckCircle,
            iconColor: 'text-emerald-500',
            animation: '/animations/success.lottie'
        },
        error: {
            icon: AlertCircle,
            iconColor: 'text-rose-500',
            animation: '/animations/error.lottie'
        },
        warning: {
            icon: AlertTriangle,
            iconColor: 'text-amber-500',
            animation: '/animations/warning.lottie'
        },
        info: {
            icon: Info,
            iconColor: 'text-sky-500',
            animation: '/animations/info.lottie'
        },
        danger: {
            icon: AlertTriangle,
            iconColor: 'text-rose-500',
            animation: '/animations/error.lottie'
        }
    };

    const config = typeConfig[type] || typeConfig.info;
    const Icon = icon || config.icon;

    // Map legacy variants to standard Button variants
    const getButtonVariant = (variant) => {
        switch (variant) {
            case 'primary': return 'default';
            case 'secondary': return 'outline';
            case 'danger': return 'destructive';
            default: return 'outline';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) onClose?.();
        }}>
            <DialogContent className="sm:max-w-[400px] border-none shadow-xl rounded-2xl p-6">
                <DialogHeader className="space-y-4">
                    {showAnimation && config.animation ? (
                        <div className="flex justify-center">
                            <DotLottiePlayer
                                src={config.animation}
                                autoplay
                                loop={false}
                                style={{ width: animationSize, height: animationSize }}
                            />
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <Icon
                                className={`h-8 w-8 ${config.iconColor}`}
                                strokeWidth={2}
                            />
                        </div>
                    )}
                    <div className="space-y-2 text-center">
                        {title && (
                            <DialogTitle className="text-lg font-bold leading-tight text-center">
                                {title}
                            </DialogTitle>
                        )}
                        {message && (
                            <DialogDescription className="text-sm text-slate-500 leading-relaxed text-center">
                                {message}
                            </DialogDescription>
                        )}
                        {children}
                    </div>
                </DialogHeader>

                {actions.length > 0 && (
                    <DialogFooter className="mt-6 flex sm:justify-end gap-2">
                        {actions.map((action, idx) => (
                            <Button
                                key={idx}
                                variant={getButtonVariant(action.variant)}
                                className={`rounded-lg px-5 h-10 text-sm font-semibold transition-all ${action.variant === 'danger' || type === 'danger' ? 'destructive' : ''
                                    }`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    action.onClick?.();
                                    onClose?.();
                                }}
                            >
                                {action.label}
                            </Button>
                        ))}
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
