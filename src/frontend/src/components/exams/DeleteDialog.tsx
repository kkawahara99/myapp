import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({ open, onClose, onConfirm, title }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>過去問の削除</DialogTitle>
      <DialogContent>
        <p>タイトル: {title}</p>
        <p>本当にこの過去問を削除しますか？</p>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button onClick={onConfirm} color="error">
          削除
        </Button>
      </DialogActions>
    </Dialog>
  );
};