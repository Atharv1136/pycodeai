import { MoreVertical, Star, Folder, ExternalLink, Edit, Trash2, Share2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'

export type Project = {
  id: string;
  name: string;
  description: string;
  language: string;
  lastModified: string;
  isFavorite: boolean;
};

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Card className="flex flex-col h-full transition-all hover:shadow-md">
      <CardHeader className="flex-row items-start gap-4 space-y-0 pb-4">
        <div className="flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
            <Folder className="h-5 w-5 text-secondary-foreground" />
          </div>
        </div>
        <div className="flex-1">
          <CardTitle className="text-lg">
            <Link href={`/editor/${project.id}`} className="hover:underline">
              {project.name}
            </Link>
          </CardTitle>
          <CardDescription className="mt-1 line-clamp-2">{project.description}</CardDescription>
        </div>
        <div className="flex items-center gap-1">
           <Button variant="ghost" size="icon" className="h-8 w-8">
             <Star className={`h-4 w-4 ${project.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
           </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem><ExternalLink className="mr-2" />Open</DropdownMenuItem>
              <DropdownMenuItem><Edit className="mr-2" />Rename</DropdownMenuItem>
              <DropdownMenuItem><Share2 className="mr-2" />Share</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2" />Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardFooter className="flex justify-between text-sm text-muted-foreground mt-auto pt-4 border-t">
        <Badge variant="outline">{project.language}</Badge>
        <span>{project.lastModified}</span>
      </CardFooter>
    </Card>
  )
}
