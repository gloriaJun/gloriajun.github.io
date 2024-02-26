#ssh
### create ssh key

`ssh-keygen`을 이용하여 key를 생성한다.

```bash
ssh-keygen -t ed25519 -C "ssh-gitlab-fe"
```


### Configure public key

접속하고자 하는 target server에 생성한 public key(`id_ed25519.pub`)를 복사한다.

#### ssh-copy-id 를 이용한 복사

```bash
# ssh-copy-id -i <생성한 private key 파일> <username>@<remote_hostname>

ssh-copy-id -i ~/.ssh/id_ed25519 user@hostname
```

#### 수동 복사

```bash
ssh user@hostname
mkdir -p ~/.ssh
chmod 700 ~/.ssh
touch ~/.ssh/authorized_keys
chmod 644 ~/.ssh/authorized_keys
```

클립보드에 복사한 public key 값을 생성한 `authorized_keys` 파일에 추가한다.
```bash
cat ~/.ssh/authorized_keys

ssh-ed25519 AAAAC3NzaC1... ssh-key
```


### Connect to server by using private key

다음과 같이 private key를 이용하여 쌍으로 생성된 public key를 복사한 target server에 패스워드 입력 없이 접속할 수 있다.

```bash
ssh -i ~/.ssh/id_ed25519 user@hostname
scp -i ~/.ssh/id_ed25519 dist.tar user@hostname:<target path>
```