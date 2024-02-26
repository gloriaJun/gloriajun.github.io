
#javascript #react #frontend


```javascript
const overlay = useOverlay();

<button
  onClick={() => {
    overlay.open(({ isOpen, close }) => {
      return (
        <BottomSheet open={isOpen} onClose={close}>
          It's bottom sheet
        </BottomSheet>
      );
    })
  }}
>
  Open
</button>
```