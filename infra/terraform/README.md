# JP2 Google Cloud Terraform

Terraform implementation is planned but not yet created.

Canonical deployment planning docs:

- [Google Cloud Launch Plan](../../docs/deployment/google-cloud-launch-plan.md)
- [Environment And Secrets Matrix](../../docs/deployment/environment-and-secrets.md)
- [Manual Google Cloud And Firebase Tasks](../../docs/deployment/manual-google-tasks.md)
- [Terraform Plan](../../docs/deployment/terraform-plan.md)

## Intended Workflow

```bash
terraform init
terraform plan -var-file=pilot.tfvars
terraform apply -var-file=pilot.tfvars
```

Do not add plaintext secrets to `.tfvars` files. Terraform should create Secret
Manager secret shells and IAM bindings; secret values should be added through
`gcloud secrets versions add` or a secured CI process.

## First Implementation Target

The first Terraform commit should add:

- provider and version files;
- variables and outputs;
- API enablement;
- service accounts;
- Artifact Registry;
- Secret Manager secret shells;
- placeholder Cloud Run service definitions that reference prebuilt images.

Cloud SQL, Firebase RTDB wiring, migration jobs, and custom domains can be added
in follow-up commits if a smaller rollout is safer. Do not add Memorystore Redis
for live pilot or production infrastructure unless a future owner-approved scope
change reverses the June 3, 2026 no-Redis decision.
