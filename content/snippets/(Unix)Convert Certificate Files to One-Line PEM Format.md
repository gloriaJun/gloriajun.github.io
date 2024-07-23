- https://docs.vmware.com/en/Unified-Access-Gateway/3.10/com.vmware.uag-310-deploy-config.doc/GUID-870AF51F-AB37-4D6C-B9F5-4BFEB18F11E9.html

```bash
awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' cert.pem
# or

awk -v ORS='\\n' '1' karnov-review.2019-01-21.private-key.pem | pbcopy
```
